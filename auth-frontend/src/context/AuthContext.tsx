import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken, clearAccessToken } from "../auth/token-manager";
import type { LoginRequest, User } from "../types/auth.types";
import {
  silentRefresh,
  getProfile,
  loginUser,
  logoutUser,
} from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
let bootPromise: Promise<User | null> | null = null;

const rehydrateSession = async (): Promise<User | null> => {
  try {
    const accessToken = await silentRefresh();
    setAccessToken(accessToken);

    const profileResponse = await getProfile();
    return profileResponse.data.user;
  } catch {
    clearAccessToken();
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Acquire or join the existing in-flight boot promise.
    if (!bootPromise) {
      bootPromise = rehydrateSession();
    }

    bootPromise.then((initialUser) => {
      setUser(initialUser);
      setLoading(false);
    });
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      const response = await loginUser(data);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      bootPromise = null;
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
      // Network failure should not prevent local session cleanup.
    } finally {
      bootPromise = null;
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
        login,
        logout,
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
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
};
