import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { type SiteRanking } from '../services/api';
import 'leaflet/dist/leaflet.css';

interface SiteMapProps {
    sites: SiteRanking[];
}

function MapUpdater({ sites }: { sites: SiteRanking[] }) {
    const map = useMap();

    useEffect(() => {
        if (sites.length > 0) {
            const topSite = sites[0];
            map.setView([topSite.lat, topSite.lng], 6, {
                animate: true,
                duration: 1
            });
        }
    }, [sites, map]);

    return null;
}

export function SiteMap({ sites }: SiteMapProps) {
    const defaultCenter: [number, number] = [39.0, -100.0];

    return (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl overflow-hidden h-full flex flex-col relative">
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 shadow-lg pointer-events-none">
                <h3 className="text-slate-800 font-bold text-sm">Geospatial Overview</h3>
                <p className="text-xs text-slate-500">{sites.length} sites mapped</p>
            </div>

            <div className="flex-1 w-full h-full min-h-[400px]">
                <MapContainer
                    center={defaultCenter}
                    zoom={4}
                    className="w-full h-full z-0"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {sites.map((site, index) => {
                        const isTop = index === 0;
                        const scoreColor = isTop ? '#f97316' : (site.performance_ratio > 0.8 ? '#10b981' : '#f59e0b');

                        return (
                            <CircleMarker
                                key={site.site_id}
                                center={[site.lat, site.lng]}
                                radius={isTop ? 12 : 6}
                                pathOptions={{
                                    color: scoreColor,
                                    fillColor: scoreColor,
                                    fillOpacity: isTop ? 0.8 : 0.4,
                                    weight: isTop ? 3 : 1
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="text-slate-800 p-1">
                                        <p className="font-bold border-b border-slate-200 pb-1 mb-1">
                                            {isTop && "👑 "}Site {site.site_id}
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            <span className="text-slate-600">Score:</span>
                                            <span className="font-bold text-slate-900">{site.daily_score.toFixed(3)}</span>
                                            <span className="text-slate-600">Rank:</span>
                                            <span className="font-bold text-slate-900">#{index + 1}</span>
                                            <span className="text-slate-600">GHI:</span>
                                            <span className="text-slate-900">{site.ghi.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                    <MapUpdater sites={sites} />
                </MapContainer>
            </div>
        </div>
    );
}
