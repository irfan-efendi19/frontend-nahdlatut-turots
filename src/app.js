import { getBooks, getBook, createBook, deleteBook } from './api.js'
import { login, logout, getCurrentUser, requireAuth } from './auth.js'

function createApp() {
  window.addEventListener('hashchange', handleRoute)
  window.addEventListener('load', handleRoute)
}

function handleRoute() {
  const hash = window.location.hash || '#login'
  const user = getCurrentUser()

  if (hash === '#login' && user) {
    window.location.hash = '#books'
    return
  }

  switch(hash) {
    case '#login':
      renderLogin()
      break
    case '#books':
      if (requireAuth()) {
        renderBooks()
      }
      break
    default:
      window.location.hash = '#login'
  }
}

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="min-vh-100 bg-light d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-4">
            <div class="card shadow-sm login-card">
              <div class="card-header bg-white text-center py-3">
                <h4 class="mb-0">Kitab Nahdlatut Turots</h4>
              </div>
              <div class="card-body p-4">
                <form id="loginForm">
                  <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" name="username" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" name="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Login
                  </button>
                </form>
                <div class="mt-3">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  document.getElementById('loginForm').addEventListener('submit', handleLogin)
}

function renderBooks() {
  const user = getCurrentUser()
  
  document.getElementById('app').innerHTML = `
    <div class="min-vh-100 bg-light">
      <nav class="navbar navbar-dark bg-primary mb-4">
        <div class="container">
          <span class="navbar-brand mb-0 h1">Kitab Nahdlatut Turots</span>
          <div class="d-flex align-items-center">
            <span class="text-white me-3">Selamat Datang, ${user.name}</span>
            <button class="btn btn-outline-light btn-sm" onclick="handleLogout()">
              <i class="bi bi-box-arrow-right me-2"></i>Keluar
            </button>
          </div>
        </div>
      </nav>

      <div class="container">
        <div class="row">
          <!-- Add Book Form -->
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Tambah Kitab Baru</h5>
              </div>
              <div class="card-body">
                <form id="addBookForm">
                  <div class="mb-3">
                    <label class="form-label">Judul</label>
                    <input type="text" class="form-control" name="title" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Penulis</label>
                    <input type="text" class="form-control" name="author" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Tahun</label>
                        <input 
                          type="number" 
                          class="form-control" 
                          name="publishedYear" 
                          min="1000" 
                          max="9999" 
                          required 
                          oninput="if(this.value.length > 4) this.value = this.value.slice(0, 4);">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Kategori</label>
                    <input type="text" class="form-control" name="genre" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Thumbnail</label>
                    <input type="file" class="form-control" name="thumbnail" accept="image/*" required>
                    <div class="form-text">Upload Sampul Kitab</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">PDF File</label>
                    <input type="file" class="form-control" name="pdf" accept=".pdf" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-plus-circle me-2"></i>Tambah Kitab
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Books List -->
          <div class="col-md-8">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Koleksi Kitab</h5>
                <span class="badge bg-primary" id="bookCount">0 books</span>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table align-middle table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Cover</th>
                        <th>Judul</th>
                        <th>Penulis</th>
                        <th>Tahun</th>
                        <th>Kategori</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="booksTableBody"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // Event Listeners
  document.getElementById('addBookForm').addEventListener('submit', handleAddBook)
  loadBooks()
}

async function handleLogin(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const username = formData.get('username')
  const password = formData.get('password')
  
  try {
    const user = login(username, password)
    window.location.hash = '#books'
    showToast('Success', 'Selamat Datang Kembali, ' + user.name)
  } catch (error) {
    showToast('Error', error.message, 'danger')
  }
}

// Add to window for onclick access
window.handleLogout = () => {
  logout()
  window.location.hash = '#login'
  showToast('Sukses', 'Sukses keluar')
}

async function handleAddBook(e) {
  e.preventDefault()
  const submitBtn = e.target.querySelector('button[type="submit"]')
  submitBtn.disabled = true
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...'
  
  const formData = new FormData(e.target)
  
  try {
    await createBook(formData)
    e.target.reset()
    loadBooks()
    showToast('Sukses', 'Sukses menambahkan kitab!', 'success')
  } catch (error) {
    showToast('Kesalahan', error.message, 'danger')
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add Book'
  }
}

function showToast(title, message, type = 'success') {
  const toastHtml = `
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type} text-white">
          <strong class="me-auto">${title}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    </div>
  `
  const toastContainer = document.createElement('div')
  toastContainer.innerHTML = toastHtml
  document.body.appendChild(toastContainer)
  
  setTimeout(() => {
    toastContainer.remove()
  }, 3000)
}

async function loadBooks() {
  try {
    const books = await getBooks()
    const tbody = document.getElementById('booksTableBody')
    document.getElementById('bookCount').textContent = `${books.length} books`
    
    tbody.innerHTML = books.map(book => `
      <tr>
        <td>
          <img 
            src="${book.thumbnailUrl}" 
            alt="${book.title} cover" 
            class="rounded shadow-sm book-cover" 
            style="width: 60px; height: 80px; object-fit: cover;"
          >
        </td>
        <td>
          <h6 class="mb-0">${book.title}</h6>
        </td>
        <td>${book.author}</td>
        <td>${book.publishedYear}</td>
        <td><span class="badge bg-secondary">${book.genre}</span></td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="handleDeleteBook('${book.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('')
  } catch (error) {
    showToast('Error', 'Tidak menemukan kitab: ' + error.message, 'danger')
  }
}

// Add to window for onclick access
window.handleDeleteBook = async (id) => {
  if (confirm('Yakin akan menghapus kitab?')) {
    try {
      await deleteBook(id)
      loadBooks()
      showToast('Success', 'Kitab telah dihapus!')
    } catch (error) {
      showToast('Error', 'Kesalahan saat menghapus kitab: ' + error.message, 'danger')
    }
  }
}

export { createApp }