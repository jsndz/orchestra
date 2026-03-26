import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import AnalysisPage from "./pages/AnalysisPage";
import { ReportPage } from "./pages/ReportPage";
import ExecutionDashboard from "./pages/ExecutionDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TasksPage />} />

      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/execution" element={<ExecutionDashboard />} />
      <Route path="/report" element={<ReportPage />} />
    </Routes>
  );
}

export default App;
