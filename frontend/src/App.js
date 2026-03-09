import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        
        {/* Universal Access */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        {/* Admin Only Routes */}
        <Route path="/manage-users" element={
          <ProtectedRoute allowedRoles={["Admin"]}><ManageUsers /></ProtectedRoute>
        } />
        
        {/* Admin & Specific Roles */}
        <Route path="/faculty" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Faculty /></ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Students /></ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Courses /></ProtectedRoute>
        } />

        {/* Faculty Specific */}
        <Route path="/mark-attendance" element={
          <ProtectedRoute allowedRoles={["Faculty", "Admin"]}><MarkAttendance /></ProtectedRoute>
        } />

        {/* HOD & Auditor Specific */}
        <Route path="/infra" element={
          <ProtectedRoute allowedRoles={["Admin", "HOD", "Auditor"]}><Infrastructure /></ProtectedRoute>
        } />
        <Route path="/complaints" element={
          <ProtectedRoute allowedRoles={["HOD", "Auditor", "Admin"]}><Complaints /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;