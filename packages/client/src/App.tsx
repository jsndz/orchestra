import { Routes, Route } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import TasksPage from "@/pages/TasksPage";
import ExecutionDashboard from "@/pages/ExecutionDashboard";
import AnalysisPage from "@/pages/AnalysisPage";
import { ReportPage } from "@/pages/ReportPage";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastContainer } from "@/components/common/Toast";

function App() {
  return (
    <ErrorBoundary fallbackTitle="Orchestra Desktop App Error">
      <>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/tasks"
            element={
              <ErrorBoundary fallbackTitle="Workflow Editor Error">
                <TasksPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/execution"
            element={
              <ErrorBoundary fallbackTitle="Execution Dashboard Error">
                <ExecutionDashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path="/analysis"
            element={
              <ErrorBoundary fallbackTitle="Analysis View Error">
                <AnalysisPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/report"
            element={
              <ErrorBoundary fallbackTitle="Report View Error">
                <ReportPage />
              </ErrorBoundary>
            }
          />
        </Routes>
        <ToastContainer />
      </>
    </ErrorBoundary>
  );
}

export default App;
