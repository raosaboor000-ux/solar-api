import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { type SiteRanking } from '../services/api';

interface SiteTableProps {
    sites: SiteRanking[];
}

export function SiteTable({ sites }: SiteTableProps) {
    const [search, setSearch] = useState('');

    const filteredSites = sites.filter(site =>
        site.site_id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-orange-100 bg-orange-50/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Site Rankings</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by coordinates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">Location</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">Score</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 border-b border-slate-200">GHI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSites.map((site, index) => (
                            <tr key={site.site_id} className="hover:bg-orange-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                <span className="text-slate-700 font-medium text-sm">{site.site_id}</span>
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
                        ))}
                        {filteredSites.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                                    No sites found matching "{search}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
