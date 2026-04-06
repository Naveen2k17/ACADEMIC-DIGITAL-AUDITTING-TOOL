import { Container, Form, Button, Card, FloatingLabel, Alert } from "react-bootstrap";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (error) { setErrorMsg("Invalid Credentials"); setMessage(null); }
  };

  const changePassword = async () => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        setErrorMsg("New passwords do not match"); return;
      }
      const res = await axios.put("http://localhost:5000/change-password", {
        email: data.email,
        currentPassword: data.password,
        newPassword: data.newPassword
      });
      setMessage(res.data.message);
      setErrorMsg(null);
      setTimeout(() => { setIsChangingPassword(false); setMessage(null); setData({}); }, 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error changing password");
      setMessage(null);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 fade-in-up">
      <Card className="glass-card p-4 mx-auto" style={{ maxWidth: '420px', width: '100%' }}>
        <Card.Body>
          <div className="text-center mb-5 mt-2">
            <h1 className="fw-bolder mb-2" style={{ letterSpacing: '-1px' }}>
              <span className="gradient-text">Audit</span>Pro
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              {isChangingPassword ? "Change your password" : "Sign in to manage academic records"}
            </p>
          </div>

          {message && <Alert variant="success" className="py-2">{message}</Alert>}
          {errorMsg && <Alert variant="danger" className="py-2">{errorMsg}</Alert>}

          {isChangingPassword ? (
             <Form>
               <FloatingLabel label="Email" className="mb-3 floating-label-custom">
                 <Form.Control type="email" placeholder="name@example.com" className="glass-input shadow-none" onChange={e => setData({ ...data, email: e.target.value })} />
               </FloatingLabel>
               <FloatingLabel label="Current Password" className="mb-3 floating-label-custom">
                 <Form.Control type="password" placeholder="Current" className="glass-input shadow-none" onChange={e => setData({ ...data, password: e.target.value })} />
               </FloatingLabel>
               <FloatingLabel label="New Password" className="mb-3 floating-label-custom">
                 <Form.Control type="password" placeholder="New" className="glass-input shadow-none" onChange={e => setData({ ...data, newPassword: e.target.value })} />
               </FloatingLabel>
               <FloatingLabel label="Confirm New Password" className="mb-4 floating-label-custom">
                 <Form.Control type="password" placeholder="Confirm" className="glass-input shadow-none" onChange={e => setData({ ...data, confirmPassword: e.target.value })} />
               </FloatingLabel>
               <Button variant="primary" className="w-100 py-3 mt-2 mb-3 fs-5" onClick={changePassword}>Update Password</Button>
               <div className="text-center pb-2">
                 <Button variant="link" className="text-decoration-none fw-semibold p-0" onClick={() => { setIsChangingPassword(false); setErrorMsg(null); setMessage(null); }}>Back to Login</Button>
               </div>
             </Form>
          ) : (
             <Form onSubmit={(e) => { e.preventDefault(); login(); }}>
               <FloatingLabel label="Email" className="mb-3 floating-label-custom">
                 <Form.Control type="email" placeholder="name@example.com" className="glass-input shadow-none" onChange={e => setData(prev => ({ ...prev, email: e.target.value }))} />
               </FloatingLabel>
               <FloatingLabel label="Password" className="mb-4 floating-label-custom">
                 <Form.Control type="password" placeholder="Password" className="glass-input shadow-none" onChange={e => setData(prev => ({ ...prev, password: e.target.value }))} />
               </FloatingLabel>
               
               <div className="text-end mb-4 mt-n2">
                 <Button variant="link" className="text-decoration-none p-0 text-muted" style={{ fontSize: '0.85rem' }} onClick={() => { setIsChangingPassword(true); setErrorMsg(null); setMessage(null); setData({}); }}>Change Password?</Button>
               </div>

               <Button variant="primary" type="submit" className="w-100 py-3 mb-4 fs-5">Sign In</Button>
             </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}