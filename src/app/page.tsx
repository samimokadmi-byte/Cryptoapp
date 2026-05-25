"use client";
import { useMarketData } from "@/hooks/useMarketData";
import Header from "@/components/Header";
import AssetCard from "@/components/AssetCard";
import AlertPanel from "@/components/AlertPanel";
import StatsSummary from "@/components/StatsSummary";
import EntryPointsPanel from "@/components/EntryPointsPanel";
import SentimentGauge from "@/components/SentimentGauge";

export default function Dashboard() {
  const { data, loading, error, lastFetch, refetch, entryPoints, sentiment, notifPermission, requestNotifPermission } = useMarketData();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header
        lastFetch={lastFetch}
        loading={loading}
        onRefresh={refetch}
        notifPermission={notifPermission}
        onEnableNotifications={requestNotifPermission}
      />

      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-3 flex items-center gap-3">
            <svg className="h-4 w-4 text-accent-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-mono text-xs text-accent-red">{error}</p>
          </div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-1 h-80 animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Sentiment + Entry Points — top row */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-px flex-1 bg-border" />
                    <h2 className="font-mono text-xs font-semibold tracking-widest text-accent-amber uppercase px-2">
                      ◈ Sentiment
                    </h2>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  {sentiment ? (
                    <SentimentGauge sentiment={sentiment} />
                  ) : (
                    <div className="rounded-xl border border-border bg-surface-1 h-28 animate-pulse" />
                  )}
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-px flex-1 bg-border" />
                    <h2 className="font-mono text-xs font-semibold tracking-widest text-accent-amber uppercase px-2">
                      ◈ Points d&apos;entrée ICT
                    </h2>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <EntryPointsPanel entries={entryPoints} />
                </div>
              </div>
            </section>

            {/* Confluence Alerts */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-mono text-xs font-semibold tracking-widest text-accent-cyan uppercase px-2">
                  ◉ Confluence Alerts
                </h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <AlertPanel confluences={data.confluences} />
            </section>

            {/* Market Overview */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase px-2">
                  ◈ Market Overview
                </h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <StatsSummary assets={data.assets} />
            </section>

            {/* Asset Grid */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase px-2">
                  ◈ Asset Analysis · 5m / 15m / 30m / 1h / 4h / 1D
                </h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {data.assets.map((asset) => (
                  <AssetCard key={asset.symbol} asset={asset} />
                ))}
              </div>
            </section>

            <footer className="pt-4 border-t border-border text-center font-mono text-xs text-slate-600">
              BTC · ETH · SOL · BNB · XRP · ADA · SUI · XAUT via Binance API ·
              Généré à {new Date(data.generated_at).toLocaleTimeString("fr-FR")} ·
              Refresh auto 30s
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
