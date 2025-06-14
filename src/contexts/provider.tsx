import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthContext } from './auth';

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading, user, api, token } = useAuth();
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      api,
      token
    }),
    [user, isLoading, isAuthenticated, api, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};