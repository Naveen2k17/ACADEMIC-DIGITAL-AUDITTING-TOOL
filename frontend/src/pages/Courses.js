import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Modal } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";

export default function Courses() {
  const [d, setD] = useState({ courseName: "", syllabus: "", coPoMapping: "" });
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    const res = await API.get("/courses");
    setList(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await API.put(`/courses/${editId}`, d);
      } else {
        await API.post("/courses", d);
      }
      resetForm();
      fetchData();
    } catch (e) {
      alert("Error saving course");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setD({ courseName: item.courseName, syllabus: item.syllabus, coPoMapping: item.coPoMapping || "" });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await API.delete(`/courses/${deleteId}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (e) { alert("Error deleting course"); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setD({ courseName: "", syllabus: "", coPoMapping: "" });
  };

  return (
    <Container className="mt-4 fade-in-up">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="glass-card sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">
                {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Add</span>} Course
              </h4>

              <FloatingLabel label="Course Name" className="mb-3 floating-label-custom">
                <Form.Control className="glass-input shadow-none" placeholder="Course Name" value={d.courseName} onChange={e => setD({ ...d, courseName: e.target.value })} />
              </FloatingLabel>

              <FloatingLabel label="Syllabus Details" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  as="textarea"
                  style={{ height: '90px' }}
                  placeholder="Describe the syllabus..."
                  value={d.syllabus}
                  onChange={e => setD({ ...d, syllabus: e.target.value })}
                />
              </FloatingLabel>

              <FloatingLabel label="CO-PO Mapping" className="mb-4 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  as="textarea"
                  style={{ height: '90px' }}
                  placeholder="e.g. CO1→PO1, CO2→PO3..."
                  value={d.coPoMapping}
                  onChange={e => setD({ ...d, coPoMapping: e.target.value })}
                />
              </FloatingLabel>

              <Button className="w-100 py-2 fw-bold" onClick={handleSave}>
                {isEditing ? "Update Course" : "Save Course"}
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
              <h4 className="fw-bolder mb-4">Course <span className="gradient-text">Registry</span></h4>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th className="border-0">Course Name</th>
                      <th className="border-0">Syllabus</th>
                      <th className="border-0">CO-PO Mapping</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item._id} style={{ backgroundColor: 'transparent' }}>
                        <td className="fw-medium">{item.courseName}</td>
                        <td style={{ color: "var(--text-muted)", maxWidth: '150px' }}>
                          <span title={item.syllabus}>{item.syllabus?.substring(0, 40)}{item.syllabus?.length > 40 ? '...' : ''}</span>
                        </td>
                        <td>
                          {item.coPoMapping
                            ? <Badge bg="info" className="rounded-pill px-2" style={{ fontSize: '0.75rem' }}>Mapped</Badge>
                            : <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(item)}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => confirmDelete(item._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-4" style={{ color: "var(--text-muted)" }}>No courses found</td></tr>
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
        <Modal.Body>Are you sure you want to delete this course? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}