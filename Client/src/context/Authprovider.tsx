// AuthContext.tsx

import { createContext, useState, ReactNode } from "react";

interface AuthContextType {
  auth: { user: string; accessToken: string; roles: string[] } | null;
  setAuth: React.Dispatch<
    React.SetStateAction<{
      user: string;
      accessToken: string;
      roles: string[];
    } | null>
  >;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<{
    user: string;
    accessToken: string;
    roles: string[];
  } | null>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
