import { Routes, Route } from "react-router-dom";

import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import LandingPage from "./pages/LandingPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Shared layout */}
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
