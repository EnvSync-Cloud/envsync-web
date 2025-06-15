import { WhoAmIResponse, EnvSyncAPISDK } from '@envsync-cloud/envsync-ts-sdk';
import { createContext } from 'react';

export interface IAuthContext {
  user: WhoAmIResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  api: EnvSyncAPISDK;
  token: string | null;
}

export const AuthContext =
  createContext<IAuthContext | null>(null);