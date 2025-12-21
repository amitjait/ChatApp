import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { signIn, signUp } from "../apis/auth";
import { notifyError, notifySuccess } from "../utils/CutomizedToast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await signIn(email, password);

      if (response.status == 200) {
        const data = await response?.data?.data;
        setToken(data?.token);
        setUser(data?.user);
        localStorage.setItem("token", data?.token);
        localStorage.setItem("user", JSON.stringify(data?.user));
        notifySuccess({ message: "Login successful" });
      } else {
        notifyError({message: response?.data?.message || 'Login failed'})
      }
    } catch (error) {
      console.error({error});
      notifyError({message: 'Login failed'})
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await signUp(name, email, password);
      if (response.status == 201) {
        const data = await response?.data?.data;
        setToken(data?.token);
        setUser(data?.user);
        localStorage.setItem("token", data?.token);
        localStorage.setItem("user", JSON.stringify(data?.user));
        notifySuccess({ message: "Signup successful" });
      } else {
        notifyError({message: 'Signup failed'})
      }
    } catch (error) {
      console.error(error);
        notifyError({message: 'Signup failed'})
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
