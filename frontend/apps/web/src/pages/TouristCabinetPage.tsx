import { Link, Route, Routes } from 'react-router-dom'

function Profile() {
  return <div>Профиль (каркас)</div>
}

function Preferences() {
  return <div>Предпочтения (каркас)</div>
}

function Bookings() {
  return <div>Бронирования (каркас)</div>
}

function Favorites() {
  return <div>Избранное (каркас)</div>
}

export function TouristCabinetPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Личный кабинет</h1>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="profile">Профиль</Link>
        <Link to="preferences">Предпочтения</Link>
        <Link to="bookings">Бронирования</Link>
        <Link to="favorites">Избранное</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="favorites" element={<Favorites />} />
      </Routes>
    </main>
  )
}

