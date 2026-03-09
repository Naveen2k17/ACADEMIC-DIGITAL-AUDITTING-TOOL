import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function ManageUsers() {
  const [user, setUser] = useState({ role: "Faculty" });
  const [users, setUsers] = useState([]);

  const fetchUsers = () => API.get("/admin/users").then(res => setUsers(res.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    try {
      await API.post("/admin/create-user", user);
      alert("User Created Successfully");
      fetchUsers();
    } catch (e) { alert("Error creating user"); }
  };

  return (
    <Container>
      <Row>
        <Col md={4}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white">Create Account</Card.Header>
            <Card.Body>
              <FloatingLabel label="Name" className="mb-2"><Form.Control onChange={e => setUser({...user, name: e.target.value})} /></FloatingLabel>
              <FloatingLabel label="Email" className="mb-2"><Form.Control onChange={e => setUser({...user, email: e.target.value})} /></FloatingLabel>
              <FloatingLabel label="Password" className="mb-2"><Form.Control type="password" onChange={e => setUser({...user, password: e.target.value})} /></FloatingLabel>
              <FloatingLabel label="Role" className="mb-3">
                <Form.Select onChange={e => setUser({...user, role: e.target.value})}>
                  <option value="Faculty">Faculty</option>
                  <option value="HOD">HOD</option>
                  <option value="Auditor">Auditor</option>
                </Form.Select>
              </FloatingLabel>
              <Button className="w-100" onClick={handleSave}>Create User</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Table striped hover>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}