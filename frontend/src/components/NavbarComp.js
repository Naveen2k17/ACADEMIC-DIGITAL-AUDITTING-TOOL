import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

export default function NavbarComp() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!role) return null; // Don't show navbar if not logged in

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top mb-4 py-3">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          AUDIT<span className="text-dark">PRO</span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            
            {role === "Admin" && (
              <>
                <Nav.Link as={Link} to="/manage-users">Users</Nav.Link>
                <Nav.Link as={Link} to="/faculty">Faculty</Nav.Link>
                <Nav.Link as={Link} to="/students">Students</Nav.Link>
                <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                <Nav.Link as={Link} to="/infra">Infrastructure</Nav.Link>
              </>
            )}

            {(role === "Faculty") && (
              <>
                <Nav.Link as={Link} to="/mark-attendance">Attendance</Nav.Link>
                <Nav.Link as={Link} to="/reports">Compliance</Nav.Link>
              </>
            )}

            {(role === "HOD") && (
              <>
                <Nav.Link as={Link} to="/reports">Compliance</Nav.Link>
              </>
            )}

            {(role === "HOD" || role === "Auditor") && (
              <Nav.Link as={Link} to="/complaints">Demands/Complaints</Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-3 px-3 py-2 rounded-pill">
              {role}
            </Badge>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}