import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoggedUser {
  token: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  currentUser: LoggedUser | null;
  setCurrentUser: (user: LoggedUser | null) => void;
  token: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token: currentUser?.token,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};