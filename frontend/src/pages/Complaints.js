import { Container, Card, Form, Button, Table, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function Complaints() {

  const [complaints, setComplaints] = useState([]);
  const [note, setNote] = useState("");
  const role = localStorage.getItem("role");

  const fetchComplaints = () => {
    API.get("/complaints").then(res => setComplaints(res.data));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const raiseDemand = async () => {
    if (!note) return;

    await API.post("/complaints", { title: note });
    setNote("");
    fetchComplaints();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/complaints/${id}`, { status });
    fetchComplaints();
  };

  return (
    <Container>

      {/* Raise Complaint */}
      {role === "HOD" && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Form.Control
              placeholder="Enter complaint / demand"
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
            <Button className="mt-2" onClick={raiseDemand}>
              Raise Demand
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Card View */}
      {complaints.map(c => (
        <Card className="mb-3 border-0 shadow-sm" key={c._id}>
          <Card.Body className="d-flex justify-content-between align-items-center">

            <div>
              <h6 className="mb-1 fw-bold">{c.title}</h6>
              <small className="text-muted">
                Raised by: {c.raisedBy}
              </small>
            </div>

            <div className="text-end">
              <Badge
                bg={c.status === "Pending" ? "warning" : "success"}
                className="mb-2 d-block"
              >
                {c.status}
              </Badge>

              {role === "Auditor" && c.status === "Pending" && (
                <Button
                  size="sm"
                  variant="outline-success"
                  onClick={()=>updateStatus(c._id,"Work Done")}
                >
                  Complete Task
                </Button>
              )}

            </div>

          </Card.Body>
        </Card>
      ))}

      {/* Table View */}
      <Table striped bordered className="mt-4">

        <thead>
          <tr>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {complaints.map(c => (
            <tr key={c._id}>

              <td>{c.title}</td>

              <td>
                <Badge bg={c.status === "Pending" ? "warning" : "success"}>
                  {c.status}
                </Badge>
              </td>

              <td>
                {role === "Auditor" && c.status === "Pending" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={()=>updateStatus(c._id,"Work Done")}
                  >
                    Mark as Done
                  </Button>
                )}
              </td>

            </tr>
          ))}

        </tbody>

      </Table>

    </Container>
  );
}