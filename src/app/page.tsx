"use client";
import { useMarketData } from "@/hooks/useMarketData";
import Header from "@/components/Header";
import AssetCard from "@/components/AssetCard";
import AlertPanel from "@/components/AlertPanel";
import StatsSummary from "@/components/StatsSummary";
import EntryPointsPanel from "@/components/EntryPointsPanel";

export default function Dashboard() {
  const { data, loading, error, lastFetch, refetch, entryPoints, notifPermission, requestNotifPermission } = useMarketData();

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
        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-3 flex items-center gap-3">
            <svg className="h-4 w-4 text-accent-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-mono text-xs text-accent-red">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-1 h-72 animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Section — Entry Points */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-mono text-xs font-semibold tracking-widest text-accent-amber uppercase px-2">
                  ◈ Points d&apos;entrée ICT
                </h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <EntryPointsPanel entries={entryPoints} />
            </section>

            {/* Section — Confluence Alerts */}
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

            {/* Section — Market Overview */}
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

            {/* Section — Asset Grid */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase px-2">
                  ◈ Asset Analysis · 15m / 30m / 1h
                </h2>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
                {data.assets.map((asset) => (
                  <AssetCard key={asset.symbol} asset={asset} />
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-4 border-t border-border text-center font-mono text-xs text-slate-600">
              Data via Binance API · Generated at{" "}
              {new Date(data.generated_at).toLocaleTimeString("en-US", { hour12: false })} UTC ·
              Auto-refresh every 30s
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
