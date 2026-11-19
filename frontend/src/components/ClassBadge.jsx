/**
 * ClassBadge
 * Props:
 *   className  (string) — 'setosa' | 'versicolor' | 'virginica' (case-insensitive)
 *   confidence (number) — 0–1 probability value
 */
const CLASS_STYLES = {
  setosa: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/50',
    text: 'text-indigo-300',
    dot: 'bg-indigo-500',
  },
  versicolor: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/50',
    text: 'text-pink-300',
    dot: 'bg-pink-500',
  },
  virginica: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    dot: 'bg-emerald-500',
  },
}

export default function ClassBadge({ className, confidence }) {
  const key = className?.toLowerCase?.().replace(/^iris-/, '') ?? ''
  const styles = CLASS_STYLES[key] ?? {
    bg: 'bg-slate-700',
    border: 'border-slate-600',
    text: 'text-slate-200',
    dot: 'bg-slate-400',
  }

  const pct =
    confidence !== undefined
      ? `${(confidence * 100).toFixed(1)}%`
      : null

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold
        ${styles.bg} ${styles.border} ${styles.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      <span className="capitalize">{className}</span>
      {pct && (
        <span className="opacity-80 font-normal">{pct}</span>
      )}
    </span>
  )
}
