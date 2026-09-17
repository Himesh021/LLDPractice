import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { PracticePage } from "./pages/PracticePage";
import { ProblemDetailsPage } from "./pages/ProblemDetailsPage";
import { ProblemsPage } from "./pages/ProblemsPage";
import { SubmissionPage } from "./pages/SubmissionPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetailsPage />} />
        <Route path="/problems/:id/practice" element={<PracticePage />} />
        <Route path="/submissions/:id" element={<SubmissionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
