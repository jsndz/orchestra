import AnalysisPanel from "@/components/analysis/AnalysisPanel";
import { useTasks } from "@/hooks/useTasks";

export default function AnalysisPage() {
  const { data } = useTasks();
  const tasks = data?.tasks ?? [];

  return (

      <AnalysisPanel tasks={tasks} />

  );
}
