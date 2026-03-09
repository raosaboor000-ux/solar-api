from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from supabase import create_client, Client
from typing import List, Dict

app = FastAPI(
    title="Solar Site Optimizer API",
    description="Optimized API for 456 Pakistan Cities using Materialized Views",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
SUPABASE_URL = "https://lkqemtanqjaafsbprppp.supabase.co"
SUPABASE_KEY = "sb_publishable_ysyd8I4sz1b67RXU505a-A_YOIc8x2T"
# We now target the VIEW which has only 456 pre-aggregated rows
VIEW_NAME = "city_solar_stats" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 1. LIGHTWEIGHT DATA FETCHING ---
async def fetch_optimized_data():
    """Fetches pre-aggregated city stats (Instant & RAM friendly)"""
    try:
        # No pagination loop needed because 456 rows fits in one request
        response = supabase.table(VIEW_NAME).select("*").execute()
        if not response.data:
            return pd.DataFrame()
        return pd.DataFrame(response.data)
    except Exception as e:
        print(f"Database Error: {e}")
        return pd.DataFrame()

# --- 2. ANALYTICS ENGINE (Optimized for Averages) ---
def process_solar_logic(df: pd.DataFrame):
    if df.empty:
        return df
        
    cols = ['ghi', 'dni', 'temp_c', 'humidity', 'aod']
    df[cols] = df[cols].apply(pd.to_numeric, errors='coerce')
    df = df.dropna(subset=['ghi', 'temp_c'])

    # Normalization (0 to 1)
    def norm_ben(s): return (s - s.min()) / (s.max() - s.min()) if s.max() != s.min() else 1.0
    def norm_cost(s): return (s.max() - s) / (s.max() - s.min()) if s.max() != s.min() else 1.0

    df['n_ghi'] = norm_ben(df['ghi'])
    df['n_dni'] = norm_ben(df['dni'])
    df['n_temp'] = norm_cost(df['temp_c'])
    df['n_hum'] = norm_cost(df['humidity'])
    df['n_aod'] = norm_cost(df['aod'])

    # Weighted Score (Applied to city averages)
    df['daily_score'] = (
        df['n_ghi'] * 0.45 + df['n_dni'] * 0.20 + 
        df['n_temp'] * 0.15 + df['n_hum'] * 0.10 + df['n_aod'] * 0.10
    )

    # Relative Benchmarking
    top_score = df['daily_score'].max()
    df['performance_ratio'] = (df['daily_score'] / top_score).round(4)
    
    def get_label(r):
        if r >= 0.99: return "Optimal (Benchmark)"
        if r >= 0.90: return "Highly Suitable"
        if r >= 0.75: return "Suitable"
        return "Sub-Optimal"
    
    df['suitability'] = df['performance_ratio'].apply(get_label)
    
    # Clean up and sort
    return df.sort_values(by='daily_score', ascending=False)

# --- 3. ENDPOINTS ---

@app.get("/health")
def health_check():
    return {"status": "online", "mode": "materialized_view_optimized"}

@app.get("/rankings")
async def get_all_rankings():
    """Returns all 456 cities instantly."""
    try:
        df = await fetch_optimized_data()
        if df.empty:
            return {"message": "No data found", "data": []}
            
        results = process_solar_logic(df)
        return results.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/top-sites")
async def get_top_sites(limit: int = 7):
    """Returns the top sites (default 7) instantly."""
    try:
        df = await fetch_optimized_data()
        if df.empty:
            return []
        results = process_solar_logic(df)
        return results.head(limit).to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))