import { useState } from 'react'

export default function ChartCard({ title, base64Image, description }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">{title}</h3>

      {/* Skeleton while image hasn't loaded */}
      {!loaded && (
        <div className="animate-pulse">
          <div className="bg-[#334155] rounded-lg w-full" style={{ aspectRatio: '4/3', minHeight: '200px' }} />
        </div>
      )}

      {base64Image ? (
        <img
          src={`data:image/png;base64,${base64Image}`}
          alt={title}
          className={`w-full rounded-lg object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          style={!loaded ? { position: 'absolute', pointerEvents: 'none' } : {}}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        !loaded && (
          <div
            className="bg-[#334155] rounded-lg flex items-center justify-center text-slate-500 text-sm"
            style={{ aspectRatio: '4/3', minHeight: '200px' }}
          >
            No image available
          </div>
        )
      )}

      {description && (
        <p className="text-slate-400 text-sm mt-3">{description}</p>
      )}
    </div>
  )
}
