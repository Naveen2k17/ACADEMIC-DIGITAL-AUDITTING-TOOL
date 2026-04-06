import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavbarComp from "./components/NavbarComp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Faculty from "./pages/Faculty";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Infrastructure from "./pages/Infrastructure";
import Reports from "./pages/Reports";
import ManageUsers from "./pages/ManageUsers";
import MarkAttendance from "./pages/MarkAttendance";
import Complaints from "./pages/Complaints";
import AuditRules from "./pages/AuditRules";
import FacultySubmissions from "./pages/FacultySubmissions";
import HODApprovals from "./pages/HODApprovals";
import CourseAssignment from "./pages/CourseAssignment";
import HODCourseOverview from "./pages/HODCourseOverview";

// Role-Based Protection Logic
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <>
      <NavbarComp />
      <div className="container-fluid py-3">{children}</div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <div className="bg-mesh"></div>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />

            {/* Universal Access */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Admin Only Routes */}
            <Route path="/manage-users" element={
              <ProtectedRoute allowedRoles={["Admin"]}><ManageUsers /></ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={["Admin"]}><Faculty /></ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={["Admin", "Student"]}><Students /></ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={["Admin"]}><Courses /></ProtectedRoute>
            } />
            <Route path="/audit-rules" element={
              <ProtectedRoute allowedRoles={["Admin"]}><AuditRules /></ProtectedRoute>
            } />

            {/* Faculty Specific */}
            <Route path="/mark-attendance" element={
              <ProtectedRoute allowedRoles={["Faculty", "Admin"]}><MarkAttendance /></ProtectedRoute>
            } />
            <Route path="/faculty-submissions" element={
              <ProtectedRoute allowedRoles={["Faculty"]}><FacultySubmissions /></ProtectedRoute>
            } />
            <Route path="/course-assignment" element={
              <ProtectedRoute allowedRoles={["Faculty", "Admin", "HOD"]}><CourseAssignment /></ProtectedRoute>
            } />

            {/* HOD Specific */}
            <Route path="/hod-approvals" element={
              <ProtectedRoute allowedRoles={["HOD"]}><HODApprovals /></ProtectedRoute>
            } />
            <Route path="/hod-course-overview" element={
              <ProtectedRoute allowedRoles={["HOD", "Admin"]}><HODCourseOverview /></ProtectedRoute>
            } />

            {/* HOD & Auditor Specific */}
            <Route path="/infra" element={
              <ProtectedRoute allowedRoles={["Admin", "HOD", "Auditor"]}><Infrastructure /></ProtectedRoute>
            } />
            <Route path="/complaints" element={
              <ProtectedRoute allowedRoles={["HOD", "Auditor", "Admin"]}><Complaints /></ProtectedRoute>
            } />

            {/* Reports — Admin & Auditor only */}
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["Admin", "Auditor"]}><Reports /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </ThemeProvider>
  );
}

export default App;