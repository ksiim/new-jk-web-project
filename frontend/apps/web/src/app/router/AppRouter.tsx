import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '../layout/AdminLayout'
import { AnalyticsPage } from '../../pages/admin/AnalyticsPage'
import { KnowledgeBasePage } from '../../pages/admin/KnowledgeBasePage'
import { SettingsPage } from '../../pages/admin/SettingsPage'
import { TicketsPage } from '../../pages/admin/TicketsPage'
import { LoginPage } from '../../pages/LoginPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tickets" replace />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
