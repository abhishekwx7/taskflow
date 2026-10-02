import { Routes, Route } from "react-router-dom";

import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/signin" element={<SignInPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/tasks" element={<Tasks />} />

        <Route path="/projects/:projectId" element={<ProjectPage />} />
      </Route>
    </Routes>
  );
}

export default App;
