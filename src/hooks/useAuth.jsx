import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // On first mount: verify session is still valid with backend
  useEffect(() => {
    const savedUser = sessionStorage.getItem('auth_user');
    if (savedUser) {
      // Silently verify token is still valid; clear session if not
      api.get('/auth/me').then((res) => {
        if (!res.success || !res.data?.user) {
          setUser(null);
          sessionStorage.removeItem('auth_user');
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
  const login = (userData) => {
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
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      sessionStorage.removeItem('auth_user');
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
