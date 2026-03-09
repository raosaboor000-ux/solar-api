from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from supabase import create_client, Client
from typing import List, Dict
import asyncio

app = FastAPI(
    title="Solar Site Optimizer API",
    description="API for calculating relative solar suitability for 456 Pakistan Cities",
    version="2.0.0"
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
TABLE_NAME = "pakistan_city_solar"  # Your updated table name
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 1. DATA FETCHING ENGINE (PAGINATED) ---
async def fetch_all_data():
    """Fetches 1M+ rows in chunks to bypass Supabase's 100k limit."""
    all_data = []
    page_size = 100000 
    offset = 0
    
    while True:
        # Fetching only necessary columns saves massive RAM/Bandwidth
        response = supabase.table(TABLE_NAME).select(
            "city_name, ghi, dni, temp_c, humidity, aod"
        ).range(offset, offset + page_size - 1).execute()
        
        data = response.data
        if not data:
            break
            
        all_data.extend(data)
        offset += page_size
        
        # Safety stop: Remove or adjust if you want the absolute full history
        if len(data) < page_size:
            break
            
    return pd.DataFrame(all_data)

# --- 2. ANALYTICS ENGINE ---
def process_solar_logic(df: pd.DataFrame):
    cols = ['ghi', 'dni', 'temp_c', 'humidity', 'aod']
    df[cols] = df[cols].apply(pd.to_numeric, errors='coerce')
    df = df.dropna(subset=['ghi', 'temp_c'])

    # Normalization Logic
    def norm_ben(s): return (s - s.min()) / (s.max() - s.min()) if s.max() != s.min() else 1.0
    def norm_cost(s): return (s.max() - s) / (s.max() - s.min()) if s.max() != s.min() else 1.0

    df['n_ghi'] = norm_ben(df['ghi'])
    df['n_dni'] = norm_ben(df['dni'])
    df['n_temp'] = norm_cost(df['temp_c'])
    df['n_hum'] = norm_cost(df['humidity'])
    df['n_aod'] = norm_cost(df['aod'])

    # Weighted Score (Pakistan-Specific)
    df['daily_score'] = (
        df['n_ghi'] * 0.45 + df['n_dni'] * 0.20 + 
        df['n_temp'] * 0.15 + df['n_hum'] * 0.10 + df['n_aod'] * 0.10
    )
    
    # Aggregating by city_name instead of lat/lng
    site_stats = df.groupby('city_name').agg({
        'daily_score': 'mean',
        'ghi': 'mean',
        'temp_c': 'mean',
        'aod': 'mean'
    }).reset_index()

    # Relative Benchmarking
    top_score = site_stats['daily_score'].max()
    site_stats['performance_ratio'] = (site_stats['daily_score'] / top_score).round(4)
    
    # Add Suitability Labels
    def get_label(r):
        if r >= 0.99: return "Optimal (Benchmark)"
        if r >= 0.90: return "Highly Suitable"
        if r >= 0.75: return "Suitable"
        return "Sub-Optimal"
    
    site_stats['suitability'] = site_stats['performance_ratio'].apply(get_label)
    
    return site_stats.sort_values(by='daily_score', ascending=False)

# --- 3. ENDPOINTS ---

@app.get("/health")
def health_check():
    return {"status": "online", "rows_processed": "dynamic"}

@app.get("/rankings")
async def get_all_rankings():
    """Returns top performing cities across Pakistan."""
    try:
        df = await fetch_all_data()
        if df.empty:
            return {"message": "No data found", "data": []}
            
        results = process_solar_logic(df)
        return results.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/top-sites")
async def get_top_sites(limit: int = 7):
    """Returns the top X (default 7) optimal cities."""
    try:
        df = await fetch_all_data()
        results = process_solar_logic(df)
        return results.head(limit).to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))