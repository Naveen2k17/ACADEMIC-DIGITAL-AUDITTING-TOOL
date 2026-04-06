import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Modal, Badge } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";

export default function Infrastructure() {
  const [d, setD] = useState({ labName: "", equipment: "", capacity: "", location: "", status: "Functional" });
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await API.get("/infra");
      setList(res.data);
    } catch (e) {
      console.log("Error fetching infra:", e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await API.put(`/infra/${editId}`, d);
      } else {
        await API.post("/infra", d);
      }
      resetForm();
      fetchData();
    } catch (e) {
      alert("Error saving infrastructure details");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setD({ 
      labName: item.labName, 
      equipment: item.equipment, 
      capacity: item.capacity || "", 
      location: item.location || "", 
      status: item.status || "Functional" 
    });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await API.delete(`/infra/${deleteId}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (e) { alert("Error deleting record"); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setD({ labName: "", equipment: "", capacity: "", location: "", status: "Functional" });
  };

  return (
    <Container className="mt-4 fade-in-up">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="glass-card sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">
                {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Add</span>} Infrastructure
              </h4>

              <FloatingLabel label="Lab / Room Name" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  placeholder="Lab Name"
                  value={d.labName}
                  onChange={e => setD({ ...d, labName: e.target.value })}
                />
              </FloatingLabel>

              <FloatingLabel label="Location / Block" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  placeholder="Location"
                  value={d.location}
                  onChange={e => setD({ ...d, location: e.target.value })}
                />
              </FloatingLabel>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <FloatingLabel label="Capacity" className="floating-label-custom">
                    <Form.Control
                      className="glass-input shadow-none"
                      type="number"
                      placeholder="0"
                      value={d.capacity}
                      onChange={e => setD({ ...d, capacity: e.target.value })}
                    />
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel label="Status" className="floating-label-custom">
                    <Form.Select
                      className="glass-input shadow-none"
                      value={d.status}
                      onChange={e => setD({ ...d, status: e.target.value })}
                    >
                      <option value="Functional">Functional</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Under Repair">Under Repair</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>

              <FloatingLabel label="Major Equipment / Details" className="mb-4 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  as="textarea"
                  style={{ height: '80px' }}
                  placeholder="List equipment..."
                  value={d.equipment}
                  onChange={e => setD({ ...d, equipment: e.target.value })}
                />
              </FloatingLabel>

              <Button className="w-100 py-2 fw-bold" onClick={handleSave}>
                {isEditing ? "Update Record" : "Save Details"}
              </Button>
              {isEditing && (
                <Button variant="outline-secondary" className="w-100 mt-2 py-2" onClick={resetForm}>Cancel</Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="glass-card">
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">Infrastructure <span className="gradient-text">Inventory</span></h4>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th className="border-0">Lab / Room</th>
                      <th className="border-0">Location</th>
                      <th className="border-0">Capacity</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item._id} style={{ backgroundColor: 'transparent' }}>
                        <td className="fw-medium">
                          {item.labName}
                          <div className="small" style={{ color: "var(--text-muted)", fontSize: '0.75rem' }}>
                            {item.equipment?.substring(0, 40)}{item.equipment?.length > 40 ? '...' : ''}
                          </div>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{item.location || "—"}</td>
                        <td>{item.capacity || 0}</td>
                        <td>
                          <Badge bg={item.status === "Functional" ? "success" : "warning"} className="rounded-pill px-3">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(item)}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => confirmDelete(item._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-4" style={{ color: "var(--text-muted)" }}>No infrastructure records found</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this infrastructure record? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}