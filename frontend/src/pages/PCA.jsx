import { useEffect, useState } from 'react'
import ChartCard from '../components/ChartCard'
import { fetchPCA } from '../api'

function VarianceBar({ component, variance }) {
  const pct = (variance * 100).toFixed(2)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300 font-medium">PC{component}</span>
        <span className="text-indigo-400 font-semibold">{pct}%</span>
      </div>
      <div className="h-3 bg-[#334155] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function PCA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPCA()
      .then(setData)
      .catch(err =>
        setError(
          err.response?.data?.error ||
            'Failed to load PCA data. Is the backend running on port 5000?'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner" />
        <p className="text-slate-400 text-sm">Loading PCA analysis…</p>
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
  const explainedVariance = data?.explained_variance ?? []
  const totalVariance = explainedVariance.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-heading text-3xl">Principal Component Analysis</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Dimensionality reduction and feature-importance analysis of the Iris dataset.
        </p>
      </div>

      {/* ── Explained variance progress bars ── */}
      {explainedVariance.length > 0 && (
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Explained Variance Ratio</h2>
            <span className="text-sm text-slate-400">
              Total: <span className="text-indigo-400 font-semibold">{(totalVariance * 100).toFixed(1)}%</span>
            </span>
          </div>
          <div className="space-y-3">
            {explainedVariance.map((v, i) => (
              <VarianceBar key={i} component={i + 1} variance={v} />
            ))}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="PCA 2D Scatter"
          base64Image={charts.pca_2d}
          description="Data projected onto the first two principal components, colored by species."
        />
        <ChartCard
          title="PCA 3D Scatter"
          base64Image={charts.pca_3d}
          description="Data projected onto three principal components for a 3D view."
        />
        <ChartCard
          title="Scree Plot"
          base64Image={charts.scree_plot}
          description="Bar chart of explained variance ratio per component with cumulative line."
        />
        <ChartCard
          title="PCA Loadings Heatmap"
          base64Image={charts.pca_loadings}
          description="Contribution of each original feature to each principal component."
        />
      </div>
    </div>
  )
}
