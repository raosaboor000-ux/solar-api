export interface APISiteRanking {
    city_name: string;
    latitude: number;
    longitude: number;
    daily_score: number;
    ghi: number;
    dni: number;
    temp_c: number;
    performance_ratio: number;
    suitability: string;
}

export interface SiteRanking extends APISiteRanking {
    lat: number;
    lng: number;
}

const API_BASE_URL = 'https://solar-api-y70r.onrender.com';

export const fetchRankings = async (): Promise<SiteRanking[]> => {
    const response = await fetch(`${API_BASE_URL}/rankings`);
    if (!response.ok) {
        throw new Error('Failed to fetch rankings');
    }

    // The new API endpoint returns a top-level JSON list, but the /rankings endpoint 
    // in api.py might return {"message": "No data found", "data": []} if empty,
    // otherwise it returns results.to_dict(orient='records') which is a list.
    const result = await response.json();
    const data: APISiteRanking[] = Array.isArray(result) ? result : result.data || [];

    return data.map(site => ({
        ...site,
        lat: site.latitude,
        lng: site.longitude
    }));
};
