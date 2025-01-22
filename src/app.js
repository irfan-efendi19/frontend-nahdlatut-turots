import { getBooks, getBook, createBook, updateBook, deleteBook } from './api.js'
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
          <span class="navbar-brand mb-0 h1"><img src="/src/img/logo.jpg" alt="Logo" width="30" height="30" class="d-inline-block align-text-top">  Repository Kitab Nahdlatut Turots</span>
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
          <!-- Add/Edit Book Form -->
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0" id="formTitle">Tambah Kitab Baru</h5>
              </div>
              <div class="card-body">
                <form id="bookForm">
                  <input type="hidden" name="bookId" id="bookId">
                  <div class="mb-3">
                    <label class="form-label">Judul</label>
                    <input type="text" class="form-control" name="title" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Penulis</label>
                    <input type="text" class="form-control" name="author" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Deskripsi</label>
                    <textarea class="form-control" name="description" rows="4" required></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Tahun</label>
                    <input type="number" class="form-control" name="published_year" min="0" max="9999" oninput="this.value = this.value.slice(0, 4);">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Kategori</label>
                    <select class="form-select" name="genre" required>
                      <option value="" disabled selected>Pilih kategori</option>
                      <option value="genre1">Genre 1</option>
                      <option value="genre2">Genre 2</option>
                      <option value="genre3">Genre 3</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Jumlah Halaman</label>
                    <input type="number" class="form-control" name="pages" min="1">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Thumbnail</label>
                    <input type="file" class="form-control" name="thumbnail" accept="image/*">
                    <div class="form-text">Upload Sampul Kitab</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">PDF File</label>
                    <input type="file" class="form-control" name="pdf" accept=".pdf">
                    <div class="form-text">Biarkan kosong untuk mempertahankan file yang ada</div>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1" id="submitBtn">
                      <i class="bi bi-plus-circle me-2"></i>Tambah Kitab
                    </button>
                    <button type="button" class="btn btn-secondary d-none" id="cancelBtn" onclick="resetForm()">
                      <i class="bi bi-x-circle me-2"></i>Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Books List -->
          <div class="col-md-8">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Koleksi Kitab</h5>
                <span class="badge bg-primary" id="bookCount">0 kitab</span>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table align-middle table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Judul</th>
                        <th>Penulis</th>
                        <th>Tahun</th>
                        <th>Kategori</th>
                        <th>Halaman</th>
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
  document.getElementById('bookForm').addEventListener('submit', handleBookSubmit)
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
    showToast('Sukses', 'Selamat Datang Kembali, ' + user.name)
  } catch (error) {
    showToast('Error', error.message, 'danger')
  }
}

window.handleLogout = () => {
  logout()
  window.location.hash = '#login'
  showToast('Sukses', 'Sukses keluar')
}

async function handleBookSubmit(e) {
  e.preventDefault()
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const formData = new FormData(e.target)
  const bookId = formData.get('bookId')
  const isEdit = bookId !== ''

  submitBtn.disabled = true
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + 
    (isEdit ? 'Memperbarui...' : 'Menambahkan...')

  // Konversi nilai 'published_year' dan 'pages' menjadi angka
  const publishedYear = Number(formData.get('published_year'))
  const pages = Number(formData.get('pages'))

  // Jika angka tidak valid, beri peringatan dan hentikan pengiriman data
  if (isNaN(publishedYear)) {
    showToast('Error', 'Tahun diterbitkan tidak valid', 'danger')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>' + (isEdit ? 'Perbarui Kitab' : 'Tambah Kitab')
    return
  }

  if (isNaN(pages)) {
    showToast('Error', 'Jumlah halaman tidak valid', 'danger')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>' + (isEdit ? 'Perbarui Kitab' : 'Tambah Kitab')
    return
  }

  // Set nilai yang sudah dikonversi ke dalam formData
  formData.set('published_year', publishedYear)
  formData.set('pages', pages)
  
  try {
    if (isEdit) {
      await updateBook(bookId, formData)
      showToast('Sukses', 'Kitab berhasil diperbarui!', 'success')
    } else {
      await createBook(formData)
      showToast('Sukses', 'Kitab berhasil ditambahkan!', 'success')
    }
    resetForm()
    loadBooks()
  } catch (error) {
    showToast('Error', error.message, 'danger')
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>' + 
      (isEdit ? 'Perbarui Kitab' : 'Tambah Kitab')
  }
}

window.editBook = async (id) => {
  try {
    const book = await getBook(id)
    const form = document.getElementById('bookForm')
    const formTitle = document.getElementById('formTitle')
    const submitBtn = document.getElementById('submitBtn')
    const cancelBtn = document.getElementById('cancelBtn')
    
    // Set form values
    form.bookId.value = book.id
    form.title.value = book.title
    form.author.value = book.author
    form.description.value = book.description
    form.published_year.value = book.published_year
    form.genre.value = book.genre
    form.pages.value = book.pages
    
    // Update UI
    formTitle.textContent = 'Edit Kitab'
    submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Perbarui Kitab'
    cancelBtn.classList.remove('d-none')
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' })
  } catch (error) {
    showToast('Error', 'Gagal memuat data kitab: ' + error.message, 'danger')
  }
}

window.resetForm = () => {
  const form = document.getElementById('bookForm')
  const formTitle = document.getElementById('formTitle')
  const submitBtn = document.getElementById('submitBtn')
  const cancelBtn = document.getElementById('cancelBtn')
  
  form.reset()
  form.bookId.value = ''
  formTitle.textContent = 'Tambah Kitab Baru'
  submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Tambah Kitab'
  cancelBtn.classList.add('d-none')
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
    document.getElementById('bookCount').textContent = `${books.length} kitab`
    
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
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.published_year}</td>
        <td><span class="badge bg-secondary">${book.genre}</span></td>
        <td>${book.pages}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-outline-primary btn-sm" onclick="editBook('${book.id}')" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="handleDeleteBook('${book.id}')" title="Hapus">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('')
  } catch (error) {
    showToast('Error', 'Tidak menemukan kitab: ' + error.message, 'danger')
  }
}

window.handleDeleteBook = async (id) => {
  if (confirm('Yakin akan menghapus kitab?')) {
    try {
      await deleteBook(id)
      loadBooks()
      showToast('Sukses', 'Kitab telah dihapus!')
    } catch (error) {
      showToast('Error', 'Kesalahan saat menghapus kitab: ' + error.message, 'danger')
    }
  }
}

export { createApp }