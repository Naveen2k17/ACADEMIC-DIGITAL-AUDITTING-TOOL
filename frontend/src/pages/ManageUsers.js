import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function ManageUsers() {
  const [user, setUser] = useState({ role: "Faculty", name: "", email: "", password: "" });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchUsers = () => API.get("/admin/users").then(res => setUsers(res.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await API.put(`/admin/users/${editId}`, user);
        alert("User Updated Successfully");
      } else {
        await API.post("/admin/create-user", user);
        alert("User Created Successfully");
      }
      resetForm();
      fetchUsers();
    } catch (e) { alert(isEditing ? "Error updating user" : "Error creating user"); }
  };

  const handleEdit = (u) => {
    setIsEditing(true);
    setEditId(u._id);
    setUser({ name: u.name, email: u.email, role: u.role, password: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (e) {
        alert("Error deleting user");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setUser({ role: "Faculty", name: "", email: "", password: "" });
  };

  return (
    <Container className="fade-in-up">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="glass-card h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">
                {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Create</span>} Account
              </h4>
              <FloatingLabel label="Full Name" className="mb-3 floating-label-custom">
                <Form.Control 
                  className="glass-input shadow-none"
                  value={user.name || ""} 
                  onChange={e => setUser({...user, name: e.target.value})} 
                />
              </FloatingLabel>
              <FloatingLabel label="Email Address" className="mb-3 floating-label-custom">
                <Form.Control 
                  className="glass-input shadow-none"
                  type="email"
                  value={user.email || ""} 
                  onChange={e => setUser({...user, email: e.target.value})} 
                />
              </FloatingLabel>
              <FloatingLabel label="Password" className="mb-3 floating-label-custom">
                <Form.Control 
                  className="glass-input shadow-none"
                  type="password" 
                  placeholder={isEditing ? "Leave blank to keep unchanged" : ""} 
                  value={user.password || ""} 
                  onChange={e => setUser({...user, password: e.target.value})} 
                />
              </FloatingLabel>
              <FloatingLabel label="Role" className="mb-4 floating-label-custom">
                <Form.Select 
                  className="glass-input shadow-none"
                  value={user.role || "Faculty"} 
                  onChange={e => setUser({...user, role: e.target.value})}
                >
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                  <option value="HOD">HOD</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Student">Student</option>
                </Form.Select>
              </FloatingLabel>
              <Button className="w-100 py-2 fs-6 fw-bold" onClick={handleSave}>
                {isEditing ? "Update User" : "Create User"}
              </Button>
              {isEditing && (
                <Button variant="outline-secondary" className="w-100 mt-3 py-2" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="glass-card shadow-sm h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">Manage <span className="gradient-text">Users</span></h4>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead style={{ backgroundColor: 'transparent' }}>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0">Email</th>
                      <th className="border-0">Role</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ backgroundColor: 'transparent' }}>
                        <td className="fw-medium">{u.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                        <td>
                          <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">{u.role}</span>
                        </td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(u)}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => handleDelete(u._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-4" style={{ color: "var(--text-muted)" }}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}