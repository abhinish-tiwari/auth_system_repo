import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios"; // Import native axios
import apiClient from "../api/api-client";
import { setAccessToken, clearAccessToken } from "../auth/token-manager";
import type { LoginRequest, User } from "../types/auth.types";
import { loginUser } from "../services/auth.service";

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
        // Fix: Call the endpoint using standard axios to avoid interceptor 401 collision
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.data.accessToken;
        setAccessToken(newAccessToken);

        // Now that token is loaded into memory, apiClient can safely fetch the profile
        const profile = await apiClient.get("/users/profile");
        setUser(profile.data.data);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
	try{
		const response = await loginUser(data);
		setAccessToken(response.data.accessToken);
		setUser(response.data.user);
	}catch  {
        clearAccessToken();
        setUser(null);
    }	  
  }

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};


// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from "react";

// import apiClient from "../api/api-client";

// import { setAccessToken, clearAccessToken } from "../auth/token-manager";

// import type { User } from "../types/auth.types";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const response = await apiClient.post("/auth/refresh");

//         setAccessToken(response.data.data.accessToken);

//         const profile = await apiClient.get("/users/profile");

//         setUser(profile.data.data);
//       } catch {
//         clearAccessToken();
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   const logout = async () => {
//     try {
//       await apiClient.post("/auth/logout");
//     } finally {
//       clearAccessToken();
//       setUser(null);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         isAuthenticated: Boolean(user),
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }

//   return context;
// };
