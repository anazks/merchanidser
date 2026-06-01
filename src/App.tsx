import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isTokenValid, logout, getToken } from './utils/auth';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseRequests from './pages/PurchaseRequests';
import Profile from './pages/Profile';

function App() {
    // Periodic session verification
    useEffect(() => {
        const interval = setInterval(() => {
            const token = getToken();
            if (token && !isTokenValid()) {
                console.warn('[App] Session expired — logging out');
                logout();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ThemeProvider>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        fontSize: '13px',
                        fontFamily: "'Inter', sans-serif",
                        borderRadius: '12px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-main)',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--brand-lime)',
                            secondary: 'var(--brand-black)',
                        },
                    },
                }}
            />
            <Router>
                <Routes>
                    {/* Public Login */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Merchandiser Dashboard */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/purchase-requests" element={<PurchaseRequests />} />
                            <Route path="/purchase-orders" element={<PurchaseOrders />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Route>

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
