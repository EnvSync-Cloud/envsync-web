import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const UsersErrorPage = () => {
  const queryClient = useQueryClient();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-red-500 text-xl">⚠️</div>
        <p className="text-gray-400">Failed to load team members</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["usersData"] })}
          className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
        >
          Retry
        </Button>
      </div>
    </div>
  );
};
