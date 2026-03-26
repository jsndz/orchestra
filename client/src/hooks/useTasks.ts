import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/tasks";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: api.fetchTasks,
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      api.addDependency(from, to),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      api.updateTask(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      api.deleteDependency(from, to),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useyaml(){
    const qc = useQueryClient();
 return useMutation({
    mutationFn: api.uploadYaml,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
export function useSystemStats() {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: api.stats,
    refetchInterval: 5000,
  });
}


export function useLogs(taskId: string | null) {
  return useQuery({
    queryKey: ["logs", taskId],
    queryFn: () => {
      if (taskId) {
        return api.fetchLogs(taskId);
      }
      return [];
    },
    enabled: !!taskId,
    refetchInterval: 2000,
  });
}

export function useStopExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.stopExecution,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}