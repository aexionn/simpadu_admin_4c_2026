import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, setTokens, clearTokens, getAccessToken, readJson } from '../../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id_user: number;
  name: string;
  email: string;
  is_active: string; // "Y" | "T"
  roles?: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;        // true saat cek sesi awal
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type ApiObject = Record<string, any>;

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Cek sesi saat pertama kali load (ada token di localStorage?)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    // Ambil data profil untuk verifikasi token masih valid
    api
      .get('/profile')
      .then(async (res) => {
        if (res.ok) {
          const data = await readJson<ApiObject>(res);
          const user: User | null = data ? data.data ?? data : null;
          if (!user) {
            clearTokens();
            setState({ user: null, isLoading: false, isAuthenticated: false });
            return;
          }
          const roles: string[] = (user.roles as any) ?? [];
          if (!roles.includes('super_admin')) {
            clearTokens();
            setState({ user: null, isLoading: false, isAuthenticated: false });
            return;
          }
          setState({ user, isLoading: false, isAuthenticated: true });
        } else {
          clearTokens();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      })
      .catch(() => {
        clearTokens();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post(
      '/auth/login',
      { email: email.trim(), password },
      { skipAuth: true, skipRefresh: true }
    );
    const data = await readJson<ApiObject>(res);

    if (!res.ok) {
      // Lempar pesan error dari backend ke komponen
      const message =
        data?.message ??
        data?.errors?.email?.[0] ??
        data?.errors?.password?.[0] ??
        'Login gagal. Periksa email dan password.';
      throw new Error(message);
    }

    // Backend mengembalikan token — struktur umum Laravel JWT/Sanctum
    const accessToken: string | undefined =
      data?.access_token ?? data?.token ?? data?.data?.access_token;
    const refreshToken: string =
      data?.refresh_token ?? data?.data?.refresh_token ?? '';

    if (!accessToken) {
      throw new Error('Token tidak ditemukan dalam respons server.');
    }

    setTokens(accessToken, refreshToken);

    // Ambil data user setelah login
    const profileRes = await api.get('/profile');
    const profileData = await readJson<ApiObject>(profileRes);

    if (!profileRes.ok) {
      clearTokens();
      const message =
        profileData?.message ??
        'Login berhasil, tetapi profil pengguna gagal dimuat.';
      throw new Error(message);
    }

    const user: User | null = profileData ? profileData.data ?? profileData : null;
    if (!user) {
      clearTokens();
      throw new Error('Login berhasil, tetapi respons profil kosong.');
    }

    // Pastikan user memiliki role super_admin
    const roles: string[] = (user.roles as any) ?? [];
    if (!roles.includes('super_admin')) {
      clearTokens();
      throw new Error('Akses ditolak. Hanya akun super_admin yang diizinkan.');
    }

    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Abaikan error saat logout
    } finally {
      clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  }
  return ctx;
}
