import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import EDA from './pages/EDA'
import PCA from './pages/PCA'
import Results from './pages/Results'

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eda" element={<EDA />} />
          <Route path="/pca" element={<PCA />} />
          <Route path="/report" element={<Results />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
