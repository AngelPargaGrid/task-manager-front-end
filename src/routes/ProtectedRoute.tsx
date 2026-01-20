import React from 'react';
import { useAuth } from '../auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="p-8 text-center text-gray-700 dark:text-gray-200">
        Cargando...
      </div>
    );
  }

  if (status !== 'authenticated') {
    // El contenedor principal (App.tsx) se encarga de mostrar Login/Register
    return null;
  }

  return <>{children}</>;
};
