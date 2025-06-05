import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthContext } from './auth';

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
    }),
    [user, isLoading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};