import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import MainLayout from './components/MainLayout';
import HiddenGames from './pages/HiddenGames';
import ManageRoms from './pages/ManageRoms';
import ManageCores from './pages/ManageCores';
import CoinScreen from './pages/CoinScreen';
import SystemSettings from './pages/SystemSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                  <ManageRoms />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/hidden" element={
            <ProtectedRoute>
              <MainLayout>
                <HiddenGames />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/manage" element={
            <ProtectedRoute>
              <MainLayout>
                <ManageRoms />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/cores" element={
            <ProtectedRoute>
              <MainLayout>
                <ManageCores />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/customization/coin" element={
            <ProtectedRoute>
              <MainLayout>
                <CoinScreen />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <MainLayout>
                <SystemSettings />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;