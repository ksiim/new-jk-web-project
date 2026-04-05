import { Link, Route, Routes } from 'react-router-dom'

function GuideProfile() {
  return <div>Профиль гида (каркас)</div>
}

function Tours() {
  return <div>Мои туры (каркас)</div>
}

function Schedule() {
  return <div>Расписание (каркас)</div>
}

function Bookings() {
  return <div>Бронирования (каркас)</div>
}

function Reviews() {
  return <div>Отзывы (каркас)</div>
}

export function GuideCabinetPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Кабинет гида</h1>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="profile">Профиль</Link>
        <Link to="tours">Туры</Link>
        <Link to="schedule">Расписание</Link>
        <Link to="bookings">Бронирования</Link>
        <Link to="reviews">Отзывы</Link>
      </nav>
      <Routes>
        <Route path="/" element={<GuideProfile />} />
        <Route path="profile" element={<GuideProfile />} />
        <Route path="tours" element={<Tours />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="reviews" element={<Reviews />} />
      </Routes>
    </main>
  )
}

