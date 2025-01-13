// Dummy user data
const users = [
  { username: 'admin', password: 'admin123', name: 'Administrator' },
  { username: 'user', password: 'user123', name: 'Regular User' }
]

export function login(username, password) {
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    const userData = { ...user }
    delete userData.password
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }
  throw new Error('Invalid username or password')
}

export function logout() {
  localStorage.removeItem('user')
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export function requireAuth() {
  if (!getCurrentUser()) {
    window.location.hash = '#login'
    return false
  }
  return true
}