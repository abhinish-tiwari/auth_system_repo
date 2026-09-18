import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import apiClient from "../api/api-client";
import { setAccessToken, clearAccessToken } from "../auth/token-manager";
import type { LoginRequest, User } from "../types/auth.types";
import { loginUser, logoutUser } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Exchange refresh token cookie for access token on application startup
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.data.accessToken;
        setAccessToken(newAccessToken);

        // Fetch user profile using authenticated apiClient
        const profile = await apiClient.get("/users/profile");
        setUser(profile.data.data.user);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      const response = await loginUser(data);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
    } catch (error) {
      clearAccessToken();
      setUser(null);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // Best-effort logout: even if server network call fails, clear local session
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
