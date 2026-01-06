import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  signUp: (email: string, password: string, fullName: string) => Promise<{ data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isTeacher: () => boolean;
  isGuardian: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
