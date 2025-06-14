
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal = ({ isOpen, onClose }: NewProjectModalProps) => {
  const { api } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: async (project: { name: string; description: string }) => {
      const response = await api.applications.createApp(project);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
    },
  });

  const handleSubmit = () => {
    if (name.trim() === "") {
        alert("Project name is required.");
        return;
    }
    if (createProject.isPending) return; // Prevent multiple submissions

    createProject.mutate({
      name: name.trim(),
      description: description.trim(),
    });

    onClose();
    setName("");
    setDescription("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="border-slate-600 text-white hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl"
              disabled={createProject.isPending}
              onClick={handleSubmit}
            >
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
