import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Modal, Alert } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

export default function AuditRules() {
  const [d, setD] = useState({ ruleName: "", type: "attendance", threshold: "", description: "" });
  const [rules, setRules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [complianceData, setComplianceData] = useState(null);

  const fetchRules = async () => {
    const res = await API.get("/audit-rules");
    setRules(res.data);
  };

  const fetchCompliance = async () => {
    try {
      const res = await API.get("/compliance");
      setComplianceData(res.data);
    } catch (e) {
      console.log("Error fetching compliance:", e);
    }
  };

  useEffect(() => { fetchRules(); fetchCompliance(); }, []);

  const handleSave = async () => {
    try {
      if (!d.ruleName || !d.threshold) {
        alert("Please fill in all required fields.");
        return;
      }
      if (isEditing) {
        await API.put(`/audit-rules/${editId}`, d);
      } else {
        await API.post("/audit-rules", d);
      }
      resetForm();
      fetchRules();
      fetchCompliance();
    } catch (e) {
      alert("Error saving rule");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setD({ ruleName: item.ruleName, type: item.type, threshold: item.threshold, description: item.description || "" });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await API.delete(`/audit-rules/${deleteId}`);
      setShowDeleteModal(false);
      fetchRules();
      fetchCompliance();
    } catch (e) { alert("Error deleting rule"); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setD({ ruleName: "", type: "attendance", threshold: "", description: "" });
  };

  const typeColors = { attendance: "primary", credits: "success" };
  const typeLabels = { attendance: "Attendance %", credits: "Min Credits" };

  return (
    <Container className="mt-4 fade-in-up">

      {/* Compliance Summary Cards */}
      {complianceData && (
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="glass-card text-center border-top border-primary border-4 h-100">
              <Card.Body className="py-4">
                <ShieldCheck size={32} className="mb-2 text-primary" />
                <h3 className="fw-bold gradient-text">{complianceData.defaulters?.length || 0}</h3>
                <p className="mb-0 fw-semibold" style={{ color: "var(--text-muted)" }}>Attendance Defaulters</p>
                <small style={{ color: "var(--text-muted)" }}>Threshold: &lt;{complianceData.threshold}%</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="glass-card text-center border-top border-success border-4 h-100">
              <Card.Body className="py-4">
                <CheckCircle size={32} className="mb-2 text-success" />
                <h3 className="fw-bold text-success">{rules.length}</h3>
                <p className="mb-0 fw-semibold" style={{ color: "var(--text-muted)" }}>Active Rules</p>
                <small style={{ color: "var(--text-muted)" }}>Compliance rules enforced</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`glass-card text-center border-top border-4 h-100 ${complianceData.defaulters?.length > 0 ? 'border-danger' : 'border-success'}`}>
              <Card.Body className="py-4">
                <AlertTriangle size={32} className={`mb-2 ${complianceData.defaulters?.length > 0 ? 'text-danger' : 'text-success'}`} />
                <h3 className={`fw-bold ${complianceData.defaulters?.length > 0 ? 'text-danger' : 'text-success'}`}>
                  {complianceData.defaulters?.length > 0 ? "Issues Found" : "All Clear"}
                </h3>
                <p className="mb-0 fw-semibold" style={{ color: "var(--text-muted)" }}>Compliance Status</p>
                <small style={{ color: "var(--text-muted)" }}>Based on active rules</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        {/* Form Panel */}
        <Col lg={4}>
          <Card className="glass-card sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">
                {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Set</span>} Compliance Rule
              </h4>

              <FloatingLabel label="Rule Name *" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  placeholder="Rule Name"
                  value={d.ruleName}
                  onChange={e => setD({ ...d, ruleName: e.target.value })}
                />
              </FloatingLabel>

              <FloatingLabel label="Rule Type" className="mb-3 floating-label-custom">
                <Form.Select
                  className="glass-input shadow-none"
                  value={d.type}
                  onChange={e => setD({ ...d, type: e.target.value })}
                >
                  <option value="attendance">Attendance Threshold (%)</option>
                  <option value="credits">Minimum Credits</option>
                </Form.Select>
              </FloatingLabel>

              <FloatingLabel label="Threshold Value *" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  type="number"
                  placeholder="e.g. 75"
                  value={d.threshold}
                  onChange={e => setD({ ...d, threshold: e.target.value })}
                />
              </FloatingLabel>

              <FloatingLabel label="Description" className="mb-4 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  as="textarea"
                  style={{ height: '80px' }}
                  placeholder="Describe this rule..."
                  value={d.description}
                  onChange={e => setD({ ...d, description: e.target.value })}
                />
              </FloatingLabel>

              <Button className="w-100 py-2 fw-bold" onClick={handleSave}>
                {isEditing ? "Update Rule" : "Create Rule"}
              </Button>
              {isEditing && (
                <Button variant="outline-secondary" className="w-100 mt-2 py-2" onClick={resetForm}>Cancel</Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Rules Table */}
        <Col lg={8}>
          <Card className="glass-card">
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">Active <span className="gradient-text">Compliance Rules</span></h4>

              {rules.length === 0 ? (
                <Alert variant="info">No audit rules configured yet. Add your first rule using the form.</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr>
                        <th className="border-0">Rule Name</th>
                        <th className="border-0">Type</th>
                        <th className="border-0">Threshold</th>
                        <th className="border-0">Description</th>
                        <th className="border-0 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((item) => (
                        <tr key={item._id} style={{ backgroundColor: 'transparent' }}>
                          <td className="fw-medium">{item.ruleName}</td>
                          <td>
                            <Badge bg={typeColors[item.type]} className="rounded-pill px-3">
                              {typeLabels[item.type]}
                            </Badge>
                          </td>
                          <td>
                            <span className="fw-bold fs-5" style={{ color: "var(--text-color)" }}>
                              {item.threshold}{item.type === "attendance" ? "%" : ""}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-muted)", fontSize: '0.85rem', maxWidth: '160px' }}>
                            {item.description || "—"}
                          </td>
                          <td className="text-end">
                            <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(item)}>Edit</Button>
                            <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => confirmDelete(item._id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Deleting this rule will affect compliance checks. Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Rule</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
