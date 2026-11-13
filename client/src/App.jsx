import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout & Protected Route
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProfilePage } from './pages/profile/ProfilePage';
import { CropRecommendation } from './pages/crops/CropRecommendation';
import { CropRecommendationResults } from './pages/crops/CropRecommendationResults';
import { DiseaseDetection } from './pages/disease/DiseaseDetection';
import { DiseaseAnalysisReport } from './pages/disease/DiseaseAnalysisReport';
import { WeatherPage } from './pages/weather/WeatherPage';
import { FertilizerAdvisory } from './pages/fertilizer/FertilizerAdvisory';
import { IrrigationAdvisory } from './pages/irrigation/IrrigationAdvisory';
import { AiAssistant } from './pages/assistant/AiAssistant';
import { HistoryPage } from './pages/history/HistoryPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Helper to redirect authenticated user away from public auth pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Routes inside AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Crop Advisory */}
              <Route path="/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/crop-recommendation/results/:id" element={<CropRecommendationResults />} />
              
              {/* Disease Detection */}
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/disease-detection/results/:id" element={<DiseaseAnalysisReport />} />
              
              {/* Weather, Fertilizer, Irrigation, Assistant */}
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/fertilizer-advisory" element={<FertilizerAdvisory />} />
              <Route path="/irrigation-advisory" element={<IrrigationAdvisory />} />
              <Route path="/ai-assistant" element={<AiAssistant />} />
              
              {/* History & Notifications & Settings */}
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<HistoryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Custom 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
