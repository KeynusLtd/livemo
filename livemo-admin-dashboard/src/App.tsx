import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />

                    {/* User Management */}
                    <Route path="users" element={<PlaceholderPage title="All Users" />} />
                    <Route path="users/verify" element={<PlaceholderPage title="User Verification" />} />

                    {/* Marketplace */}
                    <Route path="listings" element={<PlaceholderPage title="Listings Management" />} />
                    <Route path="categories" element={<PlaceholderPage title="Category Management" />} />

                    {/* Finance */}
                    <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
                    <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />

                    {/* System */}
                    <Route path="settings" element={<PlaceholderPage title="Platform Settings" />} />
                    <Route path="health" element={<PlaceholderPage title="System Health" />} />
                </Route>

                {/* Redirect root to admin for now, or login */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
