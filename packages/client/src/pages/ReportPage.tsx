import { useEffect, useState } from "react";
import { downloadYaml, execute, stopExecution } from "@/api/tasks";
import ReportNavbar from "@/components/layout/ReportNavbar";
import { useWorkflowStore } from "@/store/useAppStore";

export const ReportPage = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "stopped">("idle");
  const workflowName = useWorkflowStore((s) => s.workflowName);

  const handleYaml = async () => {
    if (!workflowName) return;

    const res = await downloadYaml(workflowName);

    const blob = new Blob([res], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    execute();
  }, []);
  const handleStop = async () => {
    if (status !== "idle") return;

    try {
      setStatus("loading");
      const result = await stopExecution();
      setStatus(result?.ok ? "stopped" : "idle");
    } catch {
      setStatus("idle");
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen">
      <ReportNavbar
        onStop={handleStop}
        onRestart={handleRestart}
        onCreateYaml={handleYaml}
        status={status}
      />
      <h1 className="text-2xl font-bold">Report</h1>
      <p>Report content goes here...</p>
    </div>
  );
};
