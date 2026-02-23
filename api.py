from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from supabase import create_client, Client

app = FastAPI()

# --- 1. CORS SETTINGS (Crucial for Frontend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any frontend to access your API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. SUPABASE CONFIG ---
SUPABASE_URL = "https://lkqemtanqjaafsbprppp.supabase.co"
SUPABASE_KEY = "sb_publishable_ysyd8I4sz1b67RXU505a-A_YOIc8x2T"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 3. LOGIC ---
def process_rankings(data):
    df = pd.DataFrame(data)
    cols = ['ghi', 'dni', 'temp_c', 'humidity', 'aod']
    df[cols] = df[cols].apply(pd.to_numeric, errors='coerce')
    
    # Normalization
    def n_ben(s): return (s - s.min()) / (s.max() - s.min()) if s.max() != s.min() else 1.0
    def n_cost(s): return (s.max() - s) / (s.max() - s.min()) if s.max() != s.min() else 1.0

    df['n_ghi'], df['n_dni'] = n_ben(df['ghi']), n_ben(df['dni'])
    df['n_temp'], df['n_hum'], df['n_aod'] = n_cost(df['temp_c']), n_cost(df['humidity']), n_cost(df['aod'])

    df['daily_score'] = (df['n_ghi']*0.45 + df['n_dni']*0.20 + df['n_temp']*0.15 + df['n_hum']*0.10 + df['n_aod']*0.10)
    df['site_id'] = df['lat'].astype(str) + ", " + df['lng'].astype(str)
    
    stats = df.groupby('site_id').agg({'daily_score':'mean', 'ghi':'mean', 'temp_c':'mean'}).reset_index()
    top_score = stats['daily_score'].max()
    stats['performance_ratio'] = (stats['daily_score'] / top_score).round(4)
    return stats.sort_values(by='daily_score', ascending=False).to_dict(orient='records')

# --- 4. ENDPOINTS ---
@app.get("/")
def home():
    return {"message": "Solar API is Live", "docs": "/docs"}

@app.get("/rankings")
async def get_rankings():
    res = supabase.table("solar_site_optimizer").select("*").execute()
    return process_rankings(res.data)