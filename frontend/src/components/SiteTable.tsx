import { useState, useMemo } from 'react';
import { Search, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { type SiteRanking } from '../services/api';

interface SiteTableProps {
    sites: SiteRanking[];
    selectedCity: SiteRanking | null;
    onSelectCity: (site: SiteRanking) => void;
}

export function SiteTable({ sites, selectedCity, onSelectCity }: SiteTableProps) {
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);

    const filteredSites = useMemo(() => {
        let result = sites;
        if (search) {
            result = sites.filter(site =>
                site.city_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (!search && !showAll) {
            // Show only top 7 when not searching and not showing all
            return result.slice(0, 7);
        }

        if (showAll && !search) {
            // Sort alphabetically when showing all
            return [...result].sort((a, b) => a.city_name.localeCompare(b.city_name));
        }

        return result;
    }, [sites, search, showAll]);

    return (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-orange-100 bg-orange-50/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Site Rankings</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by city name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-0 relative">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">Location</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">Score</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">GHI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 relative">
                        {filteredSites.map((site, index) => {
                            // Only show index rank if we are showing the original top sites without alphabetical sort
                            const displayRank = (!search && !showAll) ? index + 1 : sites.findIndex(s => s.city_name === site.city_name) + 1;
                            const isSelected = selectedCity?.city_name === site.city_name;

                            return (
                                <tr
                                    key={site.city_name}
                                    onClick={() => onSelectCity(site)}
                                    className={`transition-colors group cursor-pointer ${isSelected ? 'bg-orange-100/60 hover:bg-orange-100' : 'hover:bg-orange-50/50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${displayRank === 1 ? 'bg-orange-100 text-orange-600' : isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                #{displayRank}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                                                    <span className={`font-medium text-sm ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>{site.city_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 font-bold">{site.daily_score.toFixed(3)}</span>
                                            <span className="text-xs text-slate-500">{(site.performance_ratio * 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {site.ghi.toFixed(1)}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredSites.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                                    No sites found matching "{search}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {!search && (
                    <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent flex justify-center pb-6 border-t border-slate-100/50 z-10">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-full text-sm font-semibold shadow-sm transition-all shadow-slate-200/50"
                        >
                            {showAll ? (
                                <>Show Top 7 Only <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>View All 456 Cities <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
