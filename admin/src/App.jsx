import React from 'react';
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import MainLayout from './components/MainLayout';
import HiddenGames from './pages/HiddenGames';
import ManageRoms from './pages/ManageRoms';
import ManageCores from './pages/ManageCores';
import CoinScreen from './pages/CoinScreen';
import SystemSettings from './pages/SystemSettings';

const App = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: (
                <ProtectedRoute>
                    <MainLayout/>
                </ProtectedRoute>
            ),
            children: [
                {path: '', element: <ManageRoms/>},
                {path: 'manage', element: <ManageRoms/>},
                {path: 'hidden', element: <HiddenGames/>},
                {path: 'cores', element: <ManageCores/>},
                {path: 'customization/coin', element: <CoinScreen/>},
                {path: 'settings', element: <SystemSettings/>},
            ]
        },
        {
            path: '/login',
            element: <Login/>
        },
        {
            path: '*',
            element: <Navigate to="/" replace/>
        }
    ]);

    return (
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    );
}

export default App;