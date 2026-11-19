import { useEffect, useState } from 'react'
import ChartCard from '../components/ChartCard'
import MetricsTable from '../components/MetricsTable'
import { fetchModelReport } from '../api'

function StatCard({ label, value, sub, accent }) {
  const accentClass = {
    indigo: 'text-indigo-400',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
  }[accent] ?? 'text-slate-100'

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 shadow-lg flex flex-col gap-1">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-3xl font-bold ${accentClass}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default function Results() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchModelReport()
      .then(setData)
      .catch(err =>
        setError(
          err.response?.data?.error ||
            'Failed to load model report. Is the backend running on port 5000?'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner" />
        <p className="text-slate-400 text-sm">Loading model report…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-6 py-4 text-red-400 max-w-lg text-center">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const charts = data?.charts ?? {}
  const accuracy = data?.test_accuracy
  const epochs = data?.epochs_trained
  const report = data?.classification_report ?? ''

  const accuracyPct = accuracy !== undefined
    ? `${(accuracy * 100).toFixed(2)}%`
    : '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-heading text-3xl">Model Report</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Training results, evaluation metrics, and performance visualizations.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Test Accuracy"
          value={accuracyPct}
          sub="on held-out test set"
          accent="indigo"
        />
        <StatCard
          label="Epochs Trained"
          value={epochs ?? '—'}
          sub="with early stopping"
          accent="pink"
        />
        <StatCard
          label="Architecture"
          value="4-layer MLP"
          sub="4 → 64 → 32 → 16 → 3"
          accent="emerald"
        />
      </div>

      {/* ── Classification report table ── */}
      {report && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-100">Classification Report</h2>
          <MetricsTable report={report} />
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Confusion Matrix"
          base64Image={charts.confusion_matrix}
          description="Predicted vs actual class labels on the test set."
        />
        <ChartCard
          title="Loss Curve"
          base64Image={charts.loss_curve}
          description="Training and validation loss across epochs."
        />
        <ChartCard
          title="Accuracy Curve"
          base64Image={charts.accuracy_curve}
          description="Training and validation accuracy across epochs."
        />
      </div>
    </div>
  )
}
