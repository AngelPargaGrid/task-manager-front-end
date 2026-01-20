export type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isChecking: boolean;
}
