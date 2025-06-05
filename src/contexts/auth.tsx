import { WhoAmIResponse, AccessService } from '@envsync-cloud/envsync-ts-sdk';
import { createContext } from 'react';

export interface IAuthContext {
  user: WhoAmIResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext =
  createContext<IAuthContext | null>(null);