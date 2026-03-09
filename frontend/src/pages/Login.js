import { Container, Form, Button, Card,  FloatingLabel } from "react-bootstrap";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Login.js
export default function Login() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (error) { alert("Invalid Credentials"); }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Card className="shadow-lg p-4 border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">AuditPro</h2>
            <p className="text-muted">Sign in to manage academic records</p>
          </div>
          <Form>
            <FloatingLabel label="Email" className="mb-3">
              <Form.Control type="email" placeholder="name@example.com" onChange={e => setData({ ...data, email: e.target.value })} />
            </FloatingLabel>
            <FloatingLabel label="Password" className="mb-4">
              <Form.Control type="password" placeholder="Password" onChange={e => setData({ ...data, password: e.target.value })} />
            </FloatingLabel>
            <Button variant="primary" className="w-100 py-2 shadow-sm" onClick={login}>Login</Button>
          </Form>
          <div className="mt-4 text-center">
            <small>New here? <a href="/register" className="text-decoration-none">Create Account</a></small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}