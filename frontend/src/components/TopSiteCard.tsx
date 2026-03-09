import { Trophy, Sun, Thermometer, Activity } from 'lucide-react';
import { type SiteRanking } from '../services/api';

interface TopSiteCardProps {
    site: SiteRanking | null;
}

export function TopSiteCard({ site }: TopSiteCardProps) {
    if (!site) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-400/30 transition-all duration-500"></div>

            <div className="flex items-center gap-4 mb-6 relative">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                    <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">Optimal Site #1</h2>
                    <p className="text-slate-500 text-sm font-medium">{site.site_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative">
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-slate-500">Daily Score</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{site.daily_score.toFixed(4)}</p>
                </div>

                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-500">Perf Ratio</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{(site.performance_ratio * 100).toFixed(1)}%</p>
                </div>

                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-slate-500">Avg GHI</span>
                    </div>
                    <p className="text-lg font-bold text-slate-700">{site.ghi.toFixed(1)} <span className="text-xs text-slate-400">W/m²</span></p>
                </div>

                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-rose-500" />
                        <span className="text-sm text-slate-500">Avg Temp</span>
                    </div>
                    <p className="text-lg font-bold text-slate-700">{site.temp_c.toFixed(1)} <span className="text-xs text-slate-400">°C</span></p>
                </div>
            </div>
        </div>
    );
}
