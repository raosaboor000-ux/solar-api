import { useEffect, useState } from 'react';
import { Sun, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchRankings, type SiteRanking } from './services/api';
import { TopSiteCard } from './components/TopSiteCard';
import { SiteTable } from './components/SiteTable';
import { SiteMap } from './components/SiteMap';

export default function App() {
  const [sites, setSites] = useState<SiteRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRankings();
      setSites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/30 font-sans">
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-slate-50 opacity-80 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 text-orange-500 mb-1">
              <Sun className="w-8 h-8" />
              <h1 className="text-3xl font-black tracking-tight text-slate-800">Solar Insights</h1>
            </div>
            <p className="text-slate-500 font-medium">Optimal Solar Site Placements via AI Rankings</p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </header>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-rose-700 font-bold">Error loading rankings</h3>
              <p className="text-rose-600/80 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!error && loading && sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Analyzing geographical satellite data...</p>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[800px]">
            <div className="lg:col-span-1 flex flex-col gap-6 h-full">
              <div className="shrink-0">
                <TopSiteCard site={sites[0] || null} />
              </div>
              <div className="flex-1 min-h-0">
                <SiteTable sites={sites} />
              </div>
            </div>
            <div className="lg:col-span-2 h-full min-h-[400px]">
              <SiteMap sites={sites} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
