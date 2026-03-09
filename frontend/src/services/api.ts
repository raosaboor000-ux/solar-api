export interface APISiteRanking {
    site_id: string; // "lat, lng"
    daily_score: number;
    ghi: number;
    temp_c: number;
    performance_ratio: number;
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
    const data: APISiteRanking[] = await response.json();

    // Parse lat/lng from site_id
    return data.map(site => {
        const [latStr, lngStr] = site.site_id.split(', ');
        return {
            ...site,
            lat: parseFloat(latStr),
            lng: parseFloat(lngStr)
        };
    });
};
