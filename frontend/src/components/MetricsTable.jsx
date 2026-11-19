/**
 * MetricsTable
 * Props:
 *   report (string) — raw sklearn classification_report output
 *
 * Parses the string and renders a styled table with alternating row colors.
 */
export default function MetricsTable({ report }) {
  if (!report) return null

  const lines = report.split('\n').filter(line => line.trim() !== '')

  // First line is the header row (precision / recall / f1-score / support)
  const headerLine = lines[0]
  const headerCols = ['Class', ...headerLine.trim().split(/\s+/)]

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Lines like: "setosa       1.00      1.00      1.00        10"
    // Lines like: "accuracy                           0.97        37"
    // Lines like: "macro avg    0.97      0.97      0.97        37"

    const parts = line.split(/\s+/)
    if (parts.length === 0) continue

    // Detect multi-word labels (macro avg, weighted avg)
    if (parts.length === 5) {
      // "macro avg"  precision recall f1 support
      rows.push([`${parts[0]} ${parts[1]}`, parts[2], parts[3], parts[4], parts[5] ?? ''])
    } else if (parts.length === 4) {
      // "accuracy" only has 3 metrics (no precision/recall, just f1 & support)
      rows.push([parts[0], '', '', parts[1], parts[2]])
    } else if (parts.length >= 5) {
      rows.push([parts[0], parts[1], parts[2], parts[3], parts[4]])
    } else {
      rows.push([line, '', '', '', ''])
    }
  }

  const colStyles = {
    0: 'text-left font-medium text-slate-200',
    1: 'text-center text-indigo-400',
    2: 'text-center text-pink-400',
    3: 'text-center text-emerald-400',
    4: 'text-center text-slate-400',
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#334155] text-slate-300">
            {headerCols.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 ${i === 0 ? 'text-left' : 'text-center'} uppercase text-xs tracking-wider font-semibold`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-t border-slate-700 ${ri % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#253044]'}`}
            >
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-3 ${colStyles[ci] ?? 'text-center'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
