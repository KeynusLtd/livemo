import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAdmin from './routes/RequireAdmin';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UsersPage from './pages/users/UsersPage';
import UserVerificationPage from './pages/users/UserVerificationPage';
import ListingsPage from './pages/listings/ListingsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import AnimalCatalogsPage from './pages/catalog/AnimalCatalogsPage';
import TransactionsPage from './pages/finance/TransactionsPage';
import PayoutsPage from './pages/finance/PayoutsPage';
import SettingsPage from './pages/system/SettingsPage';
import HealthPage from './pages/system/HealthPage';
import AuditLogsPage from './pages/system/AuditLogsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<RequireAdmin />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />

                        {/* User Management */}
                        <Route path="users" element={<UsersPage />} />
                        <Route path="users/verify" element={<UserVerificationPage />} />

                        {/* Marketplace */}
                        <Route path="listings" element={<ListingsPage />} />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route path="animal-catalogs" element={<AnimalCatalogsPage />} />

                        {/* Finance */}
                        <Route path="transactions" element={<TransactionsPage />} />
                        <Route path="payouts" element={<PayoutsPage />} />

                        {/* System */}
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="health" element={<HealthPage />} />
                        <Route path="audit-logs" element={<AuditLogsPage />} />
                    </Route>
                </Route>

                {/* Redirect root to admin for now, or login */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
