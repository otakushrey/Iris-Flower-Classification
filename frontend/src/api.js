import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : ''),
  timeout: 45000,
})

export const fetchEDA = () => api.get('/api/eda').then(r => r.data)
export const fetchPCA = () => api.get('/api/pca').then(r => r.data)
export const fetchModelReport = () => api.get('/api/model-report').then(r => r.data)
export const predict = (features) =>
  api.post('/api/predict', features).then(r => r.data)

export const predictImage = (formData) =>
  api.post('/api/predict-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)

export const evaluateTestSet = (formDataOrJson) => {
  if (formDataOrJson instanceof FormData) {
    return api.post('/api/evaluate-testset', formDataOrJson, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  }
  return api.post('/api/evaluate-testset', formDataOrJson).then(r => r.data)
}

export const fetchSampleTestSet = () =>
  api.get('/api/sample-testset').then(r => r.data)

export default api
