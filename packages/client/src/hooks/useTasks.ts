import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/tasks";

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

export function useYaml(){
    const qc = useQueryClient();
 return useMutation({
    mutationFn: api.uploadYaml,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
export function useSystemStats() {
  const [dynamicStats, setDynamicStats] = useState<any>(null);

  // Fetch static stats normally (once)
  const { data: staticStats } = useQuery({
    queryKey: ["system-stats-static"],
    queryFn: api.stats,
    staleTime: Infinity,
  });

  useEffect(() => {
    // Start streaming dynamic stats from Electron Main
    window.api.startSystemStatsStream();

    // Listen to updates
    const unsubscribe = window.api.onSystemStatsUpdate((newDynamicStats: any) => {
      setDynamicStats(newDynamicStats);
    });

    // Cleanup: stop streaming and remove listener on unmount
    return () => {
      window.api.stopSystemStatsStream();
      unsubscribe();
    };
  }, []);

  // Merge static and dynamic stats
  const combined = staticStats && dynamicStats
    ? { ...staticStats, ...dynamicStats }
    : null;

  return { data: combined };
}

export function useStopExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.stopExecution,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}