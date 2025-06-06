import { useEffect, useState } from "react";
import {
  EnvSyncAPISDK,
  type WhoAmIResponse,
} from "@envsync-cloud/envsync-ts-sdk";

export const useAuth = () => {
  const [user, setUser] = useState<WhoAmIResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const accessToken = localStorage.getItem("access_token");
  const api = new EnvSyncAPISDK({
    TOKEN: accessToken,
  });

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);

      api.access
        .createWebLogin()
        .then((response) => {
          window.location.href = response.loginUrl;
        })
        .catch((error) => {
          console.error("Failed to create web login:", error);
        });
    }
    const fetchUser = async () => {
      try {
        const userData = await api.authentication.whoami();
        setUser(userData);
      } catch (error) {
        console.log(error);
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [accessToken]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    api,
  };
};
