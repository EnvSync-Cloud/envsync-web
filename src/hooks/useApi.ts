import { API_KEYS } from "@/api/constants";
import { useQueryClient } from "@tanstack/react-query";

/**
 *
 * Custom hook to invalidate API keys.
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateApiKeys: () =>
      queryClient.invalidateQueries({ queryKey: [API_KEYS.GET_API_KEYS] }),
  };
};
