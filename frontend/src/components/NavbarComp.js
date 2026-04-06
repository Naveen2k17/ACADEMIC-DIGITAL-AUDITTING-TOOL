import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function NavbarComp() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || role;
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!role) return null;

  return (
    <Navbar expand="lg" className="glass-nav sticky-top mb-4 py-3 fade-in-up">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold fs-4">
          <span className="gradient-text">AUDIT</span><span style={{ color: "var(--text-color)" }}>PRO</span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto ms-4 gap-2">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

            {/* Admin Links */}
            {role === "Admin" && (
              <>
                <Nav.Link as={Link} to="/manage-users">Users</Nav.Link>
                <Nav.Link as={Link} to="/faculty">Faculty</Nav.Link>
                <Nav.Link as={Link} to="/students">Students</Nav.Link>
                <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                <Nav.Link as={Link} to="/infra">Infrastructure</Nav.Link>
                <Nav.Link as={Link} to="/course-assignment">Course Assignment</Nav.Link>
                <Nav.Link as={Link} to="/audit-rules">Audit Rules</Nav.Link>
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
              </>
            )}

            {/* Faculty Links */}
            {role === "Faculty" && (
              <>
                <Nav.Link as={Link} to="/mark-attendance">Attendance</Nav.Link>
                <Nav.Link as={Link} to="/course-assignment">Course Assignment</Nav.Link>
                <Nav.Link as={Link} to="/faculty-submissions">My Submissions</Nav.Link>
              </>
            )}

            {/* Student Links */}
            {role === "Student" && (
              <Nav.Link as={Link} to="/students">My Details</Nav.Link>
            )}

            {/* HOD Links */}
            {role === "HOD" && (
              <>
                <Nav.Link as={Link} to="/hod-approvals">Approvals</Nav.Link>
                <Nav.Link as={Link} to="/hod-course-overview">Course Overview</Nav.Link>
                <Nav.Link as={Link} to="/course-assignment">Assign Students</Nav.Link>
                <Nav.Link as={Link} to="/infra">Infrastructure</Nav.Link>
                <Nav.Link as={Link} to="/complaints">Demands/Complaints</Nav.Link>
              </>
            )}

            {/* Auditor Links */}
            {role === "Auditor" && (
              <>
                <Nav.Link as={Link} to="/infra">Infrastructure</Nav.Link>
                <Nav.Link as={Link} to="/complaints">Demands/Complaints</Nav.Link>
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              onClick={toggleTheme}
              className="text-decoration-none p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
              style={{ color: "var(--text-color)", background: "rgba(128, 128, 128, 0.1)" }}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </Button>

            <span className="text-muted small fw-semibold me-2">{name}</span>
            <Badge bg="primary" className="px-3 py-2 rounded-pill shadow-sm">
              {role}
            </Badge>
            <Button variant="outline-primary" size="sm" onClick={handleLogout} className="rounded-pill px-4 ms-2">Logout</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}