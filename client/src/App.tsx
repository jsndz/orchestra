import { Routes, Route } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import TasksPage from "@/pages/TasksPage";
import ExecutionDashboard from "@/pages/ExecutionDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/execution" element={<ExecutionDashboard />} />
    </Routes>
  );
}

export default App;
