import { Link, Route, Routes } from 'react-router-dom'

function Users() {
  return <div>Пользователи (каркас)</div>
}

function GuidesModeration() {
  return <div>Модерация гидов (каркас)</div>
}

function ToursModeration() {
  return <div>Модерация туров (каркас)</div>
}

function PoeManagement() {
  return <div>Управление POE (каркас)</div>
}

function Reviews() {
  return <div>Отзывы (каркас)</div>
}

export function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Админка</h1>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="users">Пользователи</Link>
        <Link to="guides">Гиды</Link>
        <Link to="tours">Туры</Link>
        <Link to="poe">POE</Link>
        <Link to="reviews">Отзывы</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="users" element={<Users />} />
        <Route path="guides" element={<GuidesModeration />} />
        <Route path="tours" element={<ToursModeration />} />
        <Route path="poe" element={<PoeManagement />} />
        <Route path="reviews" element={<Reviews />} />
      </Routes>
    </main>
  )
}

