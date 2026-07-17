import { useState, type CSSProperties } from 'react'
import {
  Crosshair,
  Play,
  Square,
  Zap,
  ShieldAlert,
  Trash2,
  Activity,
  Target,
  TriangleAlert,
  Radio,
} from 'lucide-react'
import type { PumpToken } from '../hooks/usePumpFeed'
import { useSniperBot, defaultConfig, type SniperConfig, type Position } from '../hooks/useSniperBot'
import { formatAgo } from '../lib/format'

interface SniperBotProps {
  feedTokens: PumpToken[]
  feedLive: boolean
}

export default function SniperBot({ feedTokens, feedLive }: SniperBotProps) {
  const [config, setConfig] = useState<SniperConfig>(defaultConfig)
  const [running, setRunning] = useState(false)
  const bot = useSniperBot(running, config, feedTokens)

  const set = <K extends keyof SniperConfig>(k: K, v: SniperConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }))

  return (
    <section id="sniper" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3" data-reveal>
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-red">
            <Crosshair className="h-4 w-4" />
            Sniper Bot
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Snipe launches on autopilot</h2>
          <p className="mt-1 text-sm text-luff-muted">
            Auto-buy new coins the instant they mint — or only from a specific dev — with built-in
            TP / SL risk management.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-luff-ember/40 bg-luff-ember/10 px-3 py-1.5 text-xs font-medium text-luff-ember">
          <ShieldAlert className="h-3.5 w-3.5" />
          Simulation
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]" data-reveal="scale">
        {/* ---- Config ---- */}
        <div className="glass rounded-2xl p-5">
          {/* Mode */}
          <Label>Target</Label>
          <div className="mb-4 inline-flex w-full rounded-xl border border-luff-border bg-white/[0.03] p-1">
            {(['new', 'dev'] as const).map((m) => (
              <button
                key={m}
                onClick={() => set('mode', m)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  config.mode === m ? 'bg-red-grad text-white' : 'text-luff-muted hover:text-luff-text'
                }`}
              >
                {m === 'new' ? 'New launches' : 'Dev address'}
              </button>
            ))}
          </div>

          {config.mode === 'dev' && (
            <div className="mb-4">
              <Label>Dev wallet address</Label>
              <input
                value={config.devAddress}
                onChange={(e) => set('devAddress', e.target.value.trim())}
                placeholder="Paste the dev's Solana address…"
                className="w-full rounded-xl border border-luff-border bg-white/[0.03] px-3 py-2.5 font-mono text-xs outline-none focus:border-luff-red/50"
              />
              <p className="mt-1 text-[11px] text-luff-muted/70">
                Only snipes coins created by this wallet.
              </p>
            </div>
          )}

          {/* Buy amount */}
          <Num label="Buy amount (SOL)" value={config.buySol} step={0.1} min={0.01}
            onChange={(v) => set('buySol', v)} presets={[0.25, 0.5, 1, 2]} onPreset={(v) => set('buySol', v)} />

          {/* TP / SL */}
          <div className="grid grid-cols-2 gap-3">
            <Num label="Take Profit %" value={config.takeProfit} step={5} min={1} accent="up"
              onChange={(v) => set('takeProfit', v)} />
            <Num label="Stop Loss %" value={config.stopLoss} step={5} min={1} accent="down"
              onChange={(v) => set('stopLoss', v)} />
          </div>

          <Toggle label="Trailing stop" hint="Trail the stop from the peak price"
            checked={config.trailing} onChange={(v) => set('trailing', v)} />
          <Toggle label="Auto-sell (TP / SL)" hint="Close positions automatically on triggers"
            checked={config.autoSell} onChange={(v) => set('autoSell', v)} />

          {/* Advanced */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Num label="Max slippage %" value={config.maxSlippage} step={1} min={0} onChange={(v) => set('maxSlippage', v)} />
            <Num label="Priority fee (SOL)" value={config.priorityFee} step={0.001} min={0} onChange={(v) => set('priorityFee', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Num label="Min mcap (SOL)" value={config.minMcapSol} step={1} min={0} onChange={(v) => set('minMcapSol', v)} />
            <Num label="Max mcap (SOL)" value={config.maxMcapSol} step={10} min={1} onChange={(v) => set('maxMcapSol', v)} />
          </div>

          {/* Start / Stop */}
          <button
            onClick={() => setRunning((r) => !r)}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition-all active:scale-95 ${
              running
                ? 'border border-luff-down/50 bg-luff-down/15 text-luff-down hover:bg-luff-down/25'
                : 'bg-red-grad text-white shadow-glow-sm hover:shadow-glow'
            }`}
          >
            {running ? (
              <>
                <Square className="h-4 w-4" /> Stop bot
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start sniping
              </>
            )}
          </button>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-luff-muted/70">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-luff-ember" />
            Runs in real-time simulation to battle-test strategies risk-free. Live execution with real
            SOL requires a funded executor wallet + backend signer (browser wallets can’t auto-sign).
          </p>
        </div>

        {/* ---- Monitor ---- */}
        <div className="flex flex-col gap-4">
          <StatsRow bot={bot} running={running} feedLive={feedLive} config={config} />

          {/* Positions */}
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-luff-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-luff-red" /> Open positions
                <span className="text-luff-muted">({bot.stats.open.length})</span>
              </div>
              {bot.stats.open.length > 0 && (
                <button onClick={bot.sellAll} className="rounded-full border border-luff-border px-3 py-1 text-xs text-luff-muted transition-colors hover:border-luff-down/50 hover:text-luff-down">
                  Sell all
                </button>
              )}
            </div>
            {bot.stats.open.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-luff-muted">
                {running ? (
                  <span className="inline-flex items-center gap-2">
                    <Radio className="h-4 w-4 animate-pulse text-luff-red" /> Hunting for the next launch…
                  </span>
                ) : (
                  'Start the bot to begin sniping.'
                )}
              </div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <tbody>
                    {bot.stats.open.map((p) => (
                      <PositionRow key={p.id} p={p} onSell={() => bot.sellOne(p.id)} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity log */}
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-luff-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-luff-red" /> Activity
              </div>
              {bot.log.length > 0 && (
                <button onClick={bot.reset} className="inline-flex items-center gap-1 rounded-full border border-luff-border px-3 py-1 text-xs text-luff-muted transition-colors hover:border-luff-red/50 hover:text-luff-red">
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <ul className="max-h-[220px] divide-y divide-luff-border/50 overflow-y-auto font-mono text-xs">
              {bot.log.length === 0 ? (
                <li className="px-4 py-8 text-center font-sans text-luff-muted">No activity yet.</li>
              ) : (
                bot.log.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 px-4 py-2">
                    <span className="text-luff-muted/60">{new Date(l.ts).toLocaleTimeString()}</span>
                    <span className={logColor(l.kind)}>{logTag(l.kind)}</span>
                    <span className="truncate text-luff-text/90">{l.text}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- pieces ------------------------------- */

function StatsRow({
  bot,
  running,
  feedLive,
  config,
}: {
  bot: ReturnType<typeof useSniperBot>
  running: boolean
  feedLive: boolean
  config: SniperConfig
}) {
  const tiles = [
    {
      label: 'Total P&L',
      value: `${bot.stats.total >= 0 ? '+' : ''}${bot.stats.total.toFixed(3)} SOL`,
      positive: bot.stats.total >= 0,
    },
    { label: 'Win rate', value: `${bot.stats.winRate.toFixed(0)}%` },
    { label: 'Snipes', value: `${bot.stats.snipes}` },
    { label: 'Open', value: `${bot.stats.open.length}` },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="col-span-2 flex items-center justify-between rounded-2xl border border-luff-border bg-white/[0.02] px-4 py-3 sm:col-span-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={`relative flex h-2.5 w-2.5 ${running ? '' : 'opacity-40'}`}>
            {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luff-red/70" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${running ? 'bg-luff-red' : 'bg-luff-muted'}`} />
          </span>
          <span className="font-semibold">{running ? 'Bot running' : 'Bot idle'}</span>
          <span className="text-luff-muted">
            · {config.mode === 'dev' ? 'Dev sniper' : 'New launches'} · {config.buySol} SOL / snipe
          </span>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-luff-muted sm:flex">
          <Zap className={`h-3.5 w-3.5 ${feedLive ? 'text-luff-up' : 'text-luff-ember'}`} />
          pump.fun feed {feedLive ? 'live' : 'offline'}
        </span>
      </div>
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-luff-border bg-white/[0.02] p-4">
          <div className="text-xs text-luff-muted">{t.label}</div>
          <div
            className={`mt-1 font-display text-lg font-bold ${
              t.positive === undefined ? '' : t.positive ? 'text-luff-up' : 'text-luff-down'
            }`}
          >
            {t.value}
          </div>
        </div>
      ))}
    </div>
  )
}

function PositionRow({ p, onSell }: { p: Position; onSell: () => void }) {
  const pct = (p.price / p.entry - 1) * 100
  const up = pct >= 0
  return (
    <tr className="border-b border-luff-border/50 last:border-0">
      <td className="px-4 py-2.5">
        <div className="font-semibold">{p.symbol}</div>
        <div className="text-[11px] text-luff-muted">{formatAgo(p.openedAt)}</div>
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-luff-muted">{p.amountSol} SOL</td>
      <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${up ? 'text-luff-up' : 'text-luff-down'}`}>
        {up ? '+' : ''}
        {pct.toFixed(1)}%
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          onClick={onSell}
          className="rounded-full border border-luff-border px-3 py-1 text-xs text-luff-muted transition-colors hover:border-luff-down/50 hover:text-luff-down"
        >
          Sell
        </button>
      </td>
    </tr>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium">{children}</label>
}

function Num({
  label,
  value,
  onChange,
  step = 1,
  min,
  accent,
  presets,
  onPreset,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  accent?: 'up' | 'down'
  presets?: number[]
  onPreset?: (v: number) => void
}) {
  const ring = accent === 'up' ? 'focus:border-luff-up/60' : accent === 'down' ? 'focus:border-luff-down/60' : 'focus:border-luff-red/50'
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          onChange(Number.isFinite(v) ? v : 0)
        }}
        className={`w-full rounded-xl border border-luff-border bg-white/[0.03] px-3 py-2.5 text-sm tabular-nums outline-none ${ring}`}
      />
      {presets && onPreset && (
        <div className="mt-1.5 flex gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onPreset(p)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                value === p ? 'border-luff-red/60 bg-luff-red/15 text-luff-text' : 'border-luff-border text-luff-muted hover:text-luff-text'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button onClick={() => onChange(!checked)} className="mb-2 flex w-full items-center justify-between rounded-xl border border-luff-border bg-white/[0.02] px-3 py-2.5 text-left">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-[11px] text-luff-muted">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-red-grad' : 'bg-white/10'}`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: checked ? '22px' : '2px' } as CSSProperties}
        />
      </span>
    </button>
  )
}

function logColor(kind: LogKind): string {
  switch (kind) {
    case 'buy':
      return 'text-luff-up'
    case 'sell':
      return 'text-luff-ember'
    case 'skip':
      return 'text-luff-muted'
    default:
      return 'text-luff-red'
  }
}
type LogKind = 'buy' | 'sell' | 'skip' | 'info'
function logTag(kind: LogKind): string {
  return kind === 'buy' ? 'BUY ' : kind === 'sell' ? 'SELL' : kind === 'skip' ? 'SKIP' : 'INFO'
}
