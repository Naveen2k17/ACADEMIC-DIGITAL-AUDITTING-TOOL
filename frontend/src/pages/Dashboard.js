import { Container, Row, Col, Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import API from "../services/api";

// Dashboard.js
export default function Dashboard() {
  const [stats, setStats] = useState({ facultyCount: 0, studentCount: 0, courseCount: 0, infraCount: 0 });
  useEffect(() => { API.get("/stats").then(res => setStats(res.data)); }, []);

  const statCards = [
    { label: "Faculty", value: stats.facultyCount, color: "primary" },
    { label: "Students", value: stats.studentCount, color: "success" },
    { label: "Courses", value: stats.courseCount, color: "warning" },
    { label: "Infrastructure", value: stats.infraCount, color: "info" }
  ];

  return (
    <Container className="mt-4">
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border-start border-primary border-5">
        <h3 className="fw-bold m-0">Institutional Overview</h3>
        <p className="text-muted m-0">Welcome back to the Academic Audit Dashboard</p>
      </div>
      <Row className="g-4">
        {statCards.map((item, i) => (
          <Col md={3} key={i}>
            <Card className={`text-center shadow-sm h-100 border-top border-${item.color} border-4`}>
              <Card.Body className="py-4">
                <h1 className={`display-5 fw-bold text-${item.color}`}>{item.value}</h1>
                <Card.Text className="text-muted fw-semibold">{item.label}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}