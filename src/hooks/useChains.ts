import { useQuery } from "@tanstack/react-query";

interface Chain {
  name: string;
  data: string;
}

interface ChainsResponse {
  chains: Chain[];
  names: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useChains = () => {
  return useQuery<ChainsResponse>({
    queryKey: ["chains"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/chains`);
      if (!response.ok) {
        throw new Error("Failed to fetch chains");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
