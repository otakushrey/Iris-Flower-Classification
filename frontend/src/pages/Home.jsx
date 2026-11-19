import { useState } from 'react'
import ClassBadge from '../components/ClassBadge'
import ChartCard from '../components/ChartCard'
import MetricsTable from '../components/MetricsTable'
import { predict, predictImage, evaluateTestSet, fetchSampleTestSet } from '../api'

const CLASSES = ['setosa', 'versicolor', 'virginica']
const CLASS_COLORS = {
  setosa: 'bg-indigo-500',
  versicolor: 'bg-pink-500',
  virginica: 'bg-emerald-500',
}

const PRESETS = [
  { name: '🌸 Setosa Sample', data: { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 } },
  { name: '🌺 Versicolor Sample', data: { sepal_length: 5.9, sepal_width: 3.0, petal_length: 4.2, petal_width: 1.5 } },
  { name: '🪻 Virginica Sample', data: { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.5, petal_width: 2.0 } },
]

const FIELDS = [
  { key: 'sepal_length', label: 'Sepal Length', unit: 'cm', min: 4.0, max: 8.0, step: 0.1, placeholder: '5.1' },
  { key: 'sepal_width', label: 'Sepal Width', unit: 'cm', min: 2.0, max: 5.0, step: 0.1, placeholder: '3.5' },
  { key: 'petal_length', label: 'Petal Length', unit: 'cm', min: 1.0, max: 7.0, step: 0.1, placeholder: '1.4' },
  { key: 'petal_width', label: 'Petal Width', unit: 'cm', min: 0.1, max: 3.0, step: 0.1, placeholder: '0.2' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'image' | 'testset'

  // Form State
  const [form, setForm] = useState({
    sepal_length: '5.1',
    sepal_width: '3.5',
    petal_length: '1.4',
    petal_width: '0.2',
  })
  const [result, setResult] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  // Image Upload State
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageResult, setImageResult] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(null)

  // Test Set Evaluation State
  const [evalResult, setEvalResult] = useState(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [evalError, setEvalError] = useState(null)

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset) => {
    setForm({
      sepal_length: String(preset.data.sepal_length),
      sepal_width: String(preset.data.sepal_width),
      petal_length: String(preset.data.petal_length),
      petal_width: String(preset.data.petal_width),
    })
    setResult(null)
    setFormError(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setResult(null)

    const features = {}
    for (const f of FIELDS) {
      const v = parseFloat(form[f.key])
      if (isNaN(v)) {
        setFormError(`Please enter a valid number for ${f.label}.`)
        setFormLoading(false)
        return
      }
      features[f.key] = v
    }

    try {
      const data = await predict(features)
      setResult(data)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not connect to API on port 5000.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleImageSelect = (file) => {
    if (!file) return
    setImageFile(file)
    setImageError(null)
    setImageResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleImageSubmit = async () => {
    if (!imageFile && !imagePreview) {
      setImageError('Please select or upload a flower image first.')
      return
    }
    setImageLoading(true)
    setImageError(null)

    try {
      let data
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        data = await predictImage(formData)
      } else {
        data = await predictImage({ image: imagePreview })
      }
      setImageResult(data)
    } catch (err) {
      setImageError(err.response?.data?.error || 'Failed to analyze flower image.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleTestSetUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEvalLoading(true)
    setEvalError(null)
    setEvalResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await evaluateTestSet(formData)
      setEvalResult(data)
    } catch (err) {
      setEvalError(err.response?.data?.error || 'Failed to evaluate uploaded CSV test set.')
    } finally {
      setEvalLoading(false)
    }
  }

  const handleLoadSampleTestSet = async () => {
    setEvalLoading(true)
    setEvalError(null)
    setEvalResult(null)

    try {
      const sample = await fetchSampleTestSet()
      const data = await evaluateTestSet({ samples: sample.samples })
      setEvalResult(data)
    } catch (err) {
      setEvalError(err.response?.data?.error || 'Failed to load and evaluate sample test set.')
    } finally {
      setEvalLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* ── Hero Section ── */}
      <section className="text-center space-y-5 pt-6">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight pb-1">
            Iris Flower Classification
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Supervised Neural Network powered by PyTorch with full EDA, PCA, and detailed evaluation metrics.
          </p>
        </div>

        {/* Interactive Mode Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-[#1e293b] rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'form' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📐 Feature Input Form
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'image' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📷 Image Upload
            </button>
            <button
              onClick={() => setActiveTab('testset')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'testset' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Test Set Evaluation
            </button>
          </div>
        </div>
      </section>

      {/* ── TAB 1: FORM INPUT ── */}
      {activeTab === 'form' && (
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="section-heading text-xl">Flower Measurements</h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs bg-[#334155] hover:bg-indigo-600 text-slate-200 px-3 py-1.5 rounded-md transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="bg-[#1e293b] rounded-xl p-6 shadow-lg space-y-5 border border-slate-700/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map(({ key, label, unit, min, max, step, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">
                    {label} <span className="text-slate-500">({unit})</span>
                  </label>
                  <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    placeholder={`e.g. ${placeholder}`}
                    value={form[key]}
                    onChange={e => handleFormChange(key, e.target.value)}
                    required
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500">Range: {min} – {max} {unit}</p>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {formLoading ? 'Classifying…' : '🌸 Classify Flower'}
            </button>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-3 text-red-400 text-sm">
                {formError}
              </div>
            )}
          </form>

          {/* Results Card */}
          {result && (
            <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg space-y-6 border border-slate-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-slate-100">Prediction Result</h3>
                <ClassBadge
                  className={result.predicted_class || result.prediction}
                  confidence={result.confidence}
                />
              </div>

              {/* Probability bars */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">Class Probability Distribution</p>
                {CLASSES.map((cls) => {
                  const prob = result.probabilities?.[cls] ?? 0
                  const pct = (prob * 100).toFixed(1)
                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span className="capitalize">{cls}</span>
                        <span className="font-semibold text-slate-200">{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-[#334155] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${CLASS_COLORS[cls]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input summary */}
              <div className="border-t border-slate-700/80 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Evaluated Input Features</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FIELDS.map(({ key, label, unit }) => (
                    <div key={key} className="bg-[#334155] rounded-lg px-3 py-2 text-center">
                      <div className="text-xs text-slate-400">{label}</div>
                      <div className="text-slate-100 font-bold">
                        {form[key]} <span className="text-slate-400 text-xs font-normal">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── TAB 2: IMAGE UPLOAD ── */}
      {activeTab === 'image' && (
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-slate-700/60 space-y-6">
            <div>
              <h2 className="section-heading text-xl">Upload Flower Image</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upload a photo of an Iris flower or select one to extract visual characteristics and classify.
              </p>
            </div>

            {/* Drop / Select zone */}
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-pink-500 transition cursor-pointer relative bg-slate-900/40">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <span className="text-4xl">📸</span>
                <p className="text-sm text-slate-200 font-medium">Click or Drag & Drop an Iris Image here</p>
                <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP</p>
              </div>
            </div>

            {/* Image Preview & Submit */}
            {imagePreview && (
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <img
                  src={imagePreview}
                  alt="Flower preview"
                  className="w-36 h-36 object-cover rounded-lg border border-slate-600 shadow"
                />
                <div className="flex-1 space-y-3 w-full">
                  <p className="text-sm font-medium text-slate-200">Image Ready for Neural Network</p>
                  <button
                    onClick={handleImageSubmit}
                    disabled={imageLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {imageLoading ? 'Analyzing Flower Image…' : '⚡ Classify Uploaded Image'}
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-3 text-red-400 text-sm">
                {imageError}
              </div>
            )}
          </div>

          {/* Image Result Card */}
          {imageResult && (
            <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg space-y-6 border border-slate-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-slate-100">Image Classification Result</h3>
                <ClassBadge
                  className={imageResult.predicted_class}
                  confidence={imageResult.confidence}
                />
              </div>

              {/* Probabilities */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">Confidence by Class</p>
                {CLASSES.map((cls) => {
                  const prob = imageResult.probabilities?.[cls] ?? 0
                  const pct = (prob * 100).toFixed(1)
                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span className="capitalize">{cls}</span>
                        <span className="font-semibold text-slate-200">{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-[#334155] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${CLASS_COLORS[cls]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Estimated features */}
              {imageResult.extracted_features && (
                <div className="border-t border-slate-700/80 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated Morphological Features</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-[#334155] rounded-lg p-2.5 text-center">
                      <span className="text-xs text-slate-400">Sepal Length</span>
                      <p className="font-bold text-slate-100">{imageResult.extracted_features.sepal_length} cm</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-2.5 text-center">
                      <span className="text-xs text-slate-400">Sepal Width</span>
                      <p className="font-bold text-slate-100">{imageResult.extracted_features.sepal_width} cm</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-2.5 text-center">
                      <span className="text-xs text-slate-400">Petal Length</span>
                      <p className="font-bold text-slate-100">{imageResult.extracted_features.petal_length} cm</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-2.5 text-center">
                      <span className="text-xs text-slate-400">Petal Width</span>
                      <p className="font-bold text-slate-100">{imageResult.extracted_features.petal_width} cm</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── TAB 3: BATCH TEST SET EVALUATION ── */}
      {activeTab === 'testset' && (
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-slate-700/60 space-y-5">
            <div>
              <h2 className="section-heading text-xl">Evaluate Test Set</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upload a test set CSV (or test with the built-in 30-sample benchmark set) to evaluate the PyTorch neural network and generate a complete classification report with confusion matrix.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex-1 w-full bg-slate-900 border border-slate-600 hover:border-emerald-500 rounded-lg px-4 py-3 text-center cursor-pointer text-sm text-slate-300 font-medium transition">
                <span>📁 Upload Test Set CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleTestSetUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSampleTestSet}
                disabled={evalLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
              >
                {evalLoading ? 'Evaluating Model…' : '🚀 Load & Evaluate 30-Sample Test Set'}
              </button>
            </div>

            {evalError && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-3 text-red-400 text-sm">
                {evalError}
              </div>
            )}
          </div>

          {/* Test Evaluation Results */}
          {evalResult && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e293b] rounded-xl p-5 shadow border border-slate-700">
                  <p className="text-xs text-slate-400">Total Samples Tested</p>
                  <p className="text-3xl font-bold text-slate-100">{evalResult.total_samples}</p>
                </div>
                <div className="bg-[#1e293b] rounded-xl p-5 shadow border border-slate-700">
                  <p className="text-xs text-slate-400">Test Accuracy</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {evalResult.accuracy !== null ? `${(evalResult.accuracy * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-[#1e293b] rounded-xl p-5 shadow border border-slate-700">
                  <p className="text-xs text-slate-400">Evaluator</p>
                  <p className="text-xl font-bold text-indigo-400 mt-1">PyTorch IrisNet</p>
                </div>
              </div>

              {/* Classification Report & Confusion Matrix */}
              {evalResult.classification_report && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Classification Report on Uploaded Test Set</h3>
                  <MetricsTable report={evalResult.classification_report} />
                </div>
              )}

              {evalResult.confusion_matrix_chart && (
                <div className="max-w-xl mx-auto">
                  <ChartCard
                    title="Confusion Matrix (Uploaded Test Set)"
                    base64Image={evalResult.confusion_matrix_chart}
                    description="Actual vs Predicted classifications on test data."
                  />
                </div>
              )}

              {/* Detailed Sample Predictions Table */}
              {evalResult.samples && (
                <div className="bg-[#1e293b] rounded-xl p-5 shadow border border-slate-700 space-y-3">
                  <h3 className="text-base font-bold text-slate-200">Sample Predictions</h3>
                  <div className="max-h-72 overflow-y-auto overflow-x-auto rounded-lg border border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#334155] text-slate-300 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Features (SL, SW, PL, PW)</th>
                          <th className="px-3 py-2">Predicted</th>
                          <th className="px-3 py-2">Confidence</th>
                          {evalResult.has_ground_truth && <th className="px-3 py-2">Actual</th>}
                          {evalResult.has_ground_truth && <th className="px-3 py-2">Status</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/60">
                        {evalResult.samples.map(s => (
                          <tr key={s.id} className="hover:bg-slate-800/60">
                            <td className="px-3 py-2 text-slate-400">{s.id}</td>
                            <td className="px-3 py-2 text-slate-300 font-mono">
                              {s.sepal_length}, {s.sepal_width}, {s.petal_length}, {s.petal_width}
                            </td>
                            <td className="px-3 py-2 capitalize font-semibold text-indigo-300">{s.predicted_class}</td>
                            <td className="px-3 py-2 text-slate-200">{(s.confidence * 100).toFixed(1)}%</td>
                            {evalResult.has_ground_truth && (
                              <td className="px-3 py-2 capitalize text-slate-400">{s.actual_class}</td>
                            )}
                            {evalResult.has_ground_truth && (
                              <td className="px-3 py-2">
                                {s.correct ? (
                                  <span className="text-emerald-400 font-bold">✓ Match</span>
                                ) : (
                                  <span className="text-red-400 font-bold">✗ Mismatch</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
