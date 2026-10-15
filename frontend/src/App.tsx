import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Only unauthenticated users */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Route>

      {/* Only authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
