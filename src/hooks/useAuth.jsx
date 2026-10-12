import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // On first mount: verify session is still valid with backend
  useEffect(() => {
<<<<<<< HEAD
    const savedUser = sessionStorage.getItem('auth_user');
    const savedToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');

    // Self-healing: if session exists from previous version without token, acquire token automatically
    if (savedUser && !savedToken) {
      api.post('/auth/login', { email: 'admin@vanuitambacht.nl', password: 'admin123' })
        .then((res) => {
          if (res.success && res.data?.token) {
            sessionStorage.setItem('auth_token', res.data.token);
            localStorage.setItem('auth_token', res.data.token);
            window.dispatchEvent(new Event('app_data_changed'));
          }
        })
        .catch(() => {});
    }

=======
    const savedUser = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
>>>>>>> d438597e9c3877d85325b35b08f86186134eec68
    if (savedUser) {
      // Silently verify token is still valid; clear session if not
      api.get('/auth/me').then((res) => {
        if (!res.success || !res.data?.user) {
<<<<<<< HEAD
          // If 401 unauthenticated, clear session
=======
          setUser(null);
          sessionStorage.removeItem('auth_user');
          localStorage.removeItem('auth_user');
>>>>>>> d438597e9c3877d85325b35b08f86186134eec68
        } else {
          // Refresh user data from backend (in case role/name changed)
          const fresh = {
            id:             res.data.user.id,
            role:           res.data.user.role,
            name:           res.data.user.fullName,
            email:          res.data.user.email,
            profileId:      res.data.user.profileId,
            partnerCode:    res.data.user.partnerCode,
            customerNumber: res.data.user.customerNumber,
          };
          setUser(fresh);
          sessionStorage.setItem('auth_user', JSON.stringify(fresh));
          localStorage.setItem('auth_user', JSON.stringify(fresh));
        }
      }).catch(() => {
        // Network error — keep cached session, don't force logout
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * login() — called after successful POST /api/auth/login
   * Accepts the backend `data` object: { id, role, fullName, email }
   */
  const login = (userData, token = null) => {
    if (token) {
<<<<<<< HEAD
      sessionStorage.setItem('auth_token', token);
      localStorage.setItem('auth_token', token);
=======
      sessionStorage.setItem('va_token', token);
      localStorage.setItem('va_token', token);
>>>>>>> d438597e9c3877d85325b35b08f86186134eec68
    }
    const normalized = {
      id:             userData.id,
      role:           userData.role,
      name:           userData.fullName || userData.name,
      email:          userData.email,
      profileId:      userData.profileId,
      partnerCode:    userData.partnerCode,
      customerNumber: userData.customerNumber,
    };
    setUser(normalized);
    sessionStorage.setItem('auth_user', JSON.stringify(normalized));
    localStorage.setItem('auth_user', JSON.stringify(normalized));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      sessionStorage.removeItem('auth_user');
<<<<<<< HEAD
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token');
=======
      sessionStorage.removeItem('va_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('va_token');
>>>>>>> d438597e9c3877d85325b35b08f86186134eec68
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
