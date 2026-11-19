import { useEffect, useState } from 'react'
import ChartCard from '../components/ChartCard'
import { fetchEDA } from '../api'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-5 shadow-lg">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function EDA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEDA()
      .then(setData)
      .catch(err =>
        setError(
          err.response?.data?.error ||
            'Failed to load EDA data. Is the backend running on port 5000?'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner" />
        <p className="text-slate-400 text-sm">Loading EDA data…</p>
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

  const info = data?.dataset_info ?? {}
  const charts = data?.charts ?? {}

  // Class distribution
  const classDist = info.class_distribution ?? {}
  const classDistStr = Object.entries(classDist)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-heading text-3xl">Exploratory Data Analysis</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Statistical overview and visualizations of the Iris dataset.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Dataset Shape"
          value={info.shape ? `${info.shape[0]} × ${info.shape[1]}` : '—'}
          sub="rows × columns"
        />
        <StatCard
          label="Features"
          value={info.shape ? info.shape[1] - 1 : '—'}
          sub="numeric columns"
        />
        <StatCard
          label="Classes"
          value={Object.keys(classDist).length || 3}
          sub="Iris species"
        />
        <StatCard
          label="Samples / Class"
          value={Object.values(classDist)[0] ?? 50}
          sub={classDistStr || 'balanced'}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Correlation Heatmap"
          base64Image={charts.heatmap}
          description="Pearson correlation between the four Iris features."
        />
        <ChartCard
          title="Pair Plot"
          base64Image={charts.pairplot}
          description="Pairwise feature scatter plots colored by species."
        />
        <ChartCard
          title="Distribution Plots (Violin)"
          base64Image={charts.distributions}
          description="Violin plots showing feature distributions per species."
        />
        <ChartCard
          title="Box Plots"
          base64Image={charts.boxplots}
          description="Box plots highlighting median, quartiles and outliers per species."
        />
      </div>
    </div>
  )
}
