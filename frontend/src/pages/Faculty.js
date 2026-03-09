import { Container, Form, Button, Card, Row, Col, Badge, Table } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";

// Shared pattern for Faculty/Students/Courses/Infra
export default function Faculty() {
  const [d, setD] = useState({});
  const [list, setList] = useState([]);
  
  const fetchData = async () => { const res = await API.get("/faculty"); setList(res.data); };
  useEffect(() => { fetchData(); }, []);

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '100px' }}>
            <Card.Header className="bg-white py-3 fw-bold text-primary">Add Faculty Record</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control placeholder="Dr. John Doe" onChange={e => setD({ ...d, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Qualification</Form.Label>
                <Form.Control placeholder="Ph.D. Computer Science" onChange={e => setD({ ...d, qualification: e.target.value })} />
              </Form.Group>
              <Button className="w-100" onClick={async () => { await API.post("/faculty", d); fetchData(); }}>Save Record</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3 fw-bold">Active Faculty List</Card.Header>
            <Table hover responsive className="mb-0">
              <thead><tr><th>Name</th><th>Qualification</th></tr></thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={i}>
                    <td className="fw-bold">{item.name}</td>
                    <td><Badge bg="light" text="dark">{item.qualification}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}