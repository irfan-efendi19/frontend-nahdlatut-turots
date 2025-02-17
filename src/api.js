import axios from 'axios'

const API_URL = 'https://backend-644986869008.asia-southeast2.run.app'

export async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, { email, password })
    return response.data
  } catch (error) {
    throw new Error('Email dan Kata Sandi Salah')
  }
}

export function logout() {
  localStorage.removeItem('admin')
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('admin')
  return userStr ? JSON.parse(userStr) : null
}

export function requireAuth() {
  if (!getCurrentUser()) {
    window.location.hash = '#login'
    return false
  }
  return true
}

export async function getBooks() {
  const response = await axios.get(`${API_URL}/books`)
  return response.data
}

export async function getBook(id) {
  const response = await axios.get(`${API_URL}/books/${id}`)
  return response.data
}

export async function createBook(formData) {
  const response = await axios.post(`${API_URL}/books`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function updateBook(id, formData) {
  const response = await axios.put(`${API_URL}/books/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function deleteBook(id) {
  const response = await axios.delete(`${API_URL}/books/${id}`)
  return response.data
}

export async function searchBooks(query) {
  const response = await axios.get(`${API_URL}/books/search`, {
    params: { q: query }
  })
  return response.data
}