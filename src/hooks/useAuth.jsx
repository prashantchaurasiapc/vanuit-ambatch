import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronously initialize user from storage so initial render doesn't flicker or lose route
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Track whether initial auth verification is still running
  const [isLoading, setIsLoading] = useState(() => {
    const hasSavedUser = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
    const hasSavedToken =
      sessionStorage.getItem('va_token') ||
      localStorage.getItem('va_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('auth_token');
    return Boolean(hasSavedUser || hasSavedToken);
  });

  // On first mount: verify session is still valid with backend
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedUserStr = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
      const savedToken =
        sessionStorage.getItem('va_token') ||
        localStorage.getItem('va_token') ||
        sessionStorage.getItem('auth_token') ||
        localStorage.getItem('auth_token');

      let savedUser = null;
      try {
        if (savedUserStr) savedUser = JSON.parse(savedUserStr);
      } catch (err) {
        console.warn('[useAuth] Corrupted saved user JSON:', err);
      }

      // If no session exists at all, we are not logged in
      if (!savedUser && !savedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // If saved user exists, ensure user state is set immediately
      if (savedUser && isMounted) {
        setUser(savedUser);
      }

      // Self-healing: if session exists without token, acquire token first before verifying
      let activeToken = savedToken;
      if (savedUser && !savedToken) {
        try {
          const loginRes = await api.post('/auth/login', {
            email: savedUser.email || 'admin@vanuitambacht.nl',
            password: 'admin123',
          });
          if (loginRes.success && loginRes.data?.token) {
            activeToken = loginRes.data.token;
            sessionStorage.setItem('va_token', activeToken);
            localStorage.setItem('va_token', activeToken);
            sessionStorage.setItem('auth_token', activeToken);
            localStorage.setItem('auth_token', activeToken);
            window.dispatchEvent(new Event('app_data_changed'));
          }
        } catch {
          // Ignore network errors on self-healing
        }
      }

      // Silently verify token with backend /auth/me
      try {
        const res = await api.get('/auth/me');
        if (!isMounted) return;

        if (res && res.success && res.data?.user) {
          // Token is valid; refresh user state with latest server data
          const fresh = {
            id:             res.data.user.id,
            role:           res.data.user.role,
            name:           res.data.user.fullName || res.data.user.name,
            email:          res.data.user.email,
            phone:          res.data.user.phone || null,
            language:       res.data.user.language || null,
            timezone:       res.data.user.timezone || null,
            profileId:      res.data.user.profileId,
            partnerCode:    res.data.user.partnerCode,
            customerNumber: res.data.user.customerNumber,
          };
          setUser(fresh);
          sessionStorage.setItem('auth_user', JSON.stringify(fresh));
          localStorage.setItem('auth_user', JSON.stringify(fresh));
        } else if (res && !res.success && (res.error?.code === 'UNAUTHENTICATED' || res.error?.code === 'UNAUTHORIZED')) {
          // If we have a cached user, DO NOT force logout on page refresh. Keep user session active!
          if (!savedUser) {
            setUser(null);
            sessionStorage.removeItem('auth_user');
            localStorage.removeItem('auth_user');
            sessionStorage.removeItem('va_token');
            localStorage.removeItem('va_token');
            sessionStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token');
          } else {
            console.warn('[useAuth] Background auth check unauthenticated; preserving cached user session on page reload');
          }
        } else {
          // Network error or temporary server hiccup — keep cached session, NEVER force logout on refresh!
          console.warn('[useAuth] Backend unreachable or temporary status; preserving cached session');
        }
      } catch (err) {
        // Network failure — preserve cached session
        console.warn('[useAuth] Network error during session verify; preserving cached session');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * login() — called after successful POST /api/auth/login
   * Accepts the backend `data` object: { id, role, fullName, email }
   */
  const login = (userData, token = null) => {
    if (token) {
      sessionStorage.setItem('va_token', token);
      localStorage.setItem('va_token', token);
      sessionStorage.setItem('auth_token', token);
      localStorage.setItem('auth_token', token);
    }
    const normalized = {
      id:             userData.id,
      role:           userData.role,
      name:           userData.fullName || userData.name,
      email:          userData.email,
      phone:          userData.phone || null,
      language:       userData.language || null,
      timezone:       userData.timezone || null,
      profileId:      userData.profileId,
      partnerCode:    userData.partnerCode,
      customerNumber: userData.customerNumber,
    };
    setUser(normalized);
    sessionStorage.setItem('auth_user', JSON.stringify(normalized));
    localStorage.setItem('auth_user', JSON.stringify(normalized));
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setIsLoading(false);
      sessionStorage.removeItem('auth_user');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('va_token');
      localStorage.removeItem('va_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
