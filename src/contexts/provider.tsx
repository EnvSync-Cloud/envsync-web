import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthContext } from './auth';

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading, user, api } = useAuth();
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      api
    }),
    [user, isLoading, isAuthenticated, api]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};