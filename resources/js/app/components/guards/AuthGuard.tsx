import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

// ─── Spinner loading kecil ────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );
}

/**
 * RequireAuth
 * Bungkus route yang butuh autentikasi.
 * - Saat loading: tampilkan spinner
 * - Belum login: redirect ke /login (simpan tujuan asal)
 * - Sudah login: render <Outlet />
 */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * GuestOnly
 * Bungkus route yang hanya boleh diakses saat belum login (misal: /login).
 * - Saat loading: tampilkan spinner
 * - Sudah login: redirect ke /
 * - Belum login: render <Outlet />
 */
export function GuestOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
