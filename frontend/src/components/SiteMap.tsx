import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { type SiteRanking } from '../services/api';
import 'leaflet/dist/leaflet.css';

interface SiteMapProps {
    sites: SiteRanking[];
    selectedCity: SiteRanking | null;
    onSelectCity: (site: SiteRanking) => void;
}

function MapUpdater({ selectedCity }: { selectedCity: SiteRanking | null }) {
    const map = useMap();

    useEffect(() => {
        if (selectedCity) {
            map.flyTo([selectedCity.lat, selectedCity.lng], 9, {
                animate: true,
                duration: 1.5
            });
        }
    }, [selectedCity, map]);

    return null;
}

export function SiteMap({ sites, selectedCity, onSelectCity }: SiteMapProps) {
    const defaultCenter: [number, number] = [30.3753, 69.3451]; // Center of Pakistan roughly

    // Sort sites so that the selected city and top site are rendered last (on top)
    const sortedSites = [...sites].sort((a, b) => {
        const aIsSelected = a.city_name === selectedCity?.city_name;
        const bIsSelected = b.city_name === selectedCity?.city_name;
        if (aIsSelected) return 1;
        if (bIsSelected) return -1;

        const aIsTop = sites.findIndex(s => s.city_name === a.city_name) === 0;
        const bIsTop = sites.findIndex(s => s.city_name === b.city_name) === 0;
        if (aIsTop) return 1;
        if (bIsTop) return -1;

        return 0;
    });

    return (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl overflow-hidden h-full flex flex-col relative">
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 shadow-lg pointer-events-none">
                <h3 className="text-slate-800 font-bold text-sm">Geospatial Overview</h3>
                <p className="text-xs text-slate-500">{sites.length} cities mapped</p>
            </div>

            <div className="flex-1 w-full h-full min-h-[400px]">
                <MapContainer
                    center={selectedCity ? [selectedCity.lat, selectedCity.lng] : defaultCenter}
                    zoom={5}
                    className="w-full h-full z-0"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {sortedSites.map((site) => {
                        // Ranking is based on the original array order
                        const rank = sites.findIndex(s => s.city_name === site.city_name) + 1;
                        const isTop = rank === 1;
                        const isSelected = selectedCity?.city_name === site.city_name;

                        let scoreColor = '#f59e0b'; // Amber for standard
                        if (isTop) scoreColor = '#f97316'; // Orange for #1
                        else if (site.performance_ratio > 0.8) scoreColor = '#10b981'; // Emerald for highly suitable

                        return (
                            <CircleMarker
                                key={site.city_name}
                                center={[site.lat, site.lng]}
                                radius={isSelected ? 14 : isTop ? 12 : 6}
                                eventHandlers={{
                                    click: () => onSelectCity(site),
                                }}
                                pathOptions={{
                                    color: scoreColor,
                                    fillColor: scoreColor,
                                    fillOpacity: isSelected ? 0.9 : isTop ? 0.8 : 0.4,
                                    weight: isSelected ? 4 : isTop ? 3 : 1
                                }}
                            >
                                <Popup className="custom-popup" autoPan={false}>
                                    <div className="text-slate-800 p-1 min-w-[180px]">
                                        <p className="font-bold border-b border-slate-200 pb-1 mb-2 text-base">
                                            {isTop && "👑 "}{site.city_name}
                                        </p>
                                        <div className="mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isTop ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                {site.suitability}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                            <span className="text-slate-500">Score:</span>
                                            <span className="font-bold text-slate-900">{site.daily_score.toFixed(3)}</span>

                                            <span className="text-slate-500">Rank:</span>
                                            <span className="font-bold text-slate-900">#{rank}</span>

                                            <span className="text-slate-500">Perf:</span>
                                            <span className="text-slate-900">{(site.performance_ratio * 100).toFixed(1)}%</span>

                                            <span className="text-slate-500">GHI:</span>
                                            <span className="text-slate-900">{site.ghi.toFixed(1)} <span className="text-[9px] text-slate-400">W/m²</span></span>

                                            <span className="text-slate-500">DNI:</span>
                                            <span className="text-slate-900">{site.dni?.toFixed(1) || '0.0'} <span className="text-[9px] text-slate-400">W/m²</span></span>

                                            <span className="text-slate-500">Temp:</span>
                                            <span className="text-slate-900">{site.temp_c.toFixed(1)} <span className="text-[9px] text-slate-400">°C</span></span>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                    <MapUpdater selectedCity={selectedCity} />
                </MapContainer>
            </div>
        </div>
    );
}
