import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminPage } from '../../pages/AdminPage'
import { GuideCabinetPage } from '../../pages/GuideCabinetPage'
import { GuideProfilesPage } from '../../pages/GuideProfilesPage'
import { HomePage } from '../../pages/HomePage'
import { TouristCabinetPage } from '../../pages/TouristCabinetPage'
import { ToursCatalogPage } from '../../pages/ToursCatalogPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tours" element={<ToursCatalogPage />} />
      <Route path="/guides" element={<GuideProfilesPage />} />

      <Route path="/account/*" element={<TouristCabinetPage />} />
      <Route path="/guide/*" element={<GuideCabinetPage />} />
      <Route path="/admin/*" element={<AdminPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

