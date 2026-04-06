import { Container, Card, Row, Col, Badge, Button, Modal, Form, Alert, Tab, Tabs } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, MessageSquare, Eye, Clock, BookOpen, FileText } from "lucide-react";

const statusColors = {
  "Pending": "warning",
  "Approved": "success",
  "Rejected": "danger",
  "Correction Requested": "info",
  "Update Requested": "info"
};

function ApprovalCard({ item, type, onAction }) {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState("");

  const openAction = (action) => {
    setActionType(action);
    setRemarks("");
    setViewMode(false);
    setShowModal(true);
  };

  const openView = () => {
    setViewMode(true);
    setShowModal(true);
  };

  const handleConfirm = () => {
    onAction(item._id, actionType, remarks);
    setShowModal(false);
  };

  const needsRemarks = ["Rejected", "Correction Requested", "Update Requested"].includes(actionType);
  const isPub = type === "publication";

  return (
    <>
      <Card className="glass-card mb-3" style={{ borderLeft: `4px solid var(--bs-${statusColors[item.status]})` }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h6 className="fw-bolder mb-1">{isPub ? item.title : item.courseName}</h6>
              <small style={{ color: "var(--text-muted)" }}>
                {isPub
                  ? `By ${item.facultyName} · ${item.journal} · ${item.year || "N/A"}`
                  : `Submitted by ${item.submittedBy} · ${new Date(item.submittedAt).toLocaleDateString()}`
                }
              </small>
            </div>
            <Badge bg={statusColors[item.status]} className="rounded-pill px-3 py-2">{item.status}</Badge>
          </div>

          {item.remarks && (
            <Alert variant="secondary" className="py-2 mb-3" style={{ fontSize: "0.85rem" }}>
              <strong>Remarks:</strong> {item.remarks}
            </Alert>
          )}

          <div className="d-flex gap-2 flex-wrap">
            {/* View */}
            <Button size="sm" variant="outline-primary" className="rounded-pill px-3 d-flex align-items-center gap-1" onClick={openView}>
              <Eye size={14} /> View {isPub ? "Publication" : "Syllabus"}
            </Button>

            {item.status === "Pending" && (
              <>
                {/* Approve */}
                <Button size="sm" variant="success" className="rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => openAction("Approved")}>
                  <CheckCircle size={14} /> Approve
                </Button>
                {/* Reject */}
                <Button size="sm" variant="danger" className="rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => openAction("Rejected")}>
                  <XCircle size={14} /> Reject
                </Button>
                {/* Request Correction / Update */}
                <Button size="sm" variant="info" className="rounded-pill px-3 d-flex align-items-center gap-1 text-white" onClick={() => openAction(isPub ? "Correction Requested" : "Update Requested")}>
                  <MessageSquare size={14} /> {isPub ? "Request Correction" : "Request Update"}
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Action / View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ border: "none" }}>
          <Modal.Title className="fw-bolder">
            {viewMode ? (isPub ? "📄 Publication Details" : "📚 Syllabus Details") : `Confirm: ${actionType}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {viewMode ? (
            <div>
              {isPub ? (
                <Row className="g-3">
                  <Col md={6}><strong>Title:</strong><p className="mt-1">{item.title}</p></Col>
                  <Col md={6}><strong>Journal / Conference:</strong><p className="mt-1">{item.journal}</p></Col>
                  <Col md={6}><strong>Author(s):</strong><p className="mt-1">{item.author}</p></Col>
                  <Col md={6}><strong>Year:</strong><p className="mt-1">{item.year || "N/A"}</p></Col>
                  <Col md={6}><strong>Submitted By:</strong><p className="mt-1">{item.facultyName}</p></Col>
                  <Col md={6}><strong>Submitted On:</strong><p className="mt-1">{new Date(item.submittedAt).toLocaleString()}</p></Col>
                  {item.remarks && <Col md={12}><strong>Remarks:</strong><p className="mt-1 text-muted">{item.remarks}</p></Col>}
                </Row>
              ) : (
                <Row className="g-3">
                  <Col md={6}><strong>Course Name:</strong><p className="mt-1">{item.courseName}</p></Col>
                  <Col md={6}><strong>Submitted By:</strong><p className="mt-1">{item.submittedBy}</p></Col>
                  <Col md={12}><strong>Syllabus Content:</strong><p className="mt-1 p-3 rounded" style={{ background: "rgba(0,0,0,0.05)", whiteSpace: "pre-wrap" }}>{item.syllabus}</p></Col>
                  {item.coPoMapping && <Col md={12}><strong>CO-PO Mapping:</strong><p className="mt-1 p-3 rounded" style={{ background: "rgba(0,0,0,0.05)", whiteSpace: "pre-wrap" }}>{item.coPoMapping}</p></Col>}
                  {item.remarks && <Col md={12}><strong>HOD Remarks:</strong><p className="mt-1 text-muted">{item.remarks}</p></Col>}
                </Row>
              )}
            </div>
          ) : (
            <div>
              <Alert variant={actionType === "Approved" ? "success" : actionType === "Rejected" ? "danger" : "info"} className="mb-3">
                You are about to <strong>{actionType.toLowerCase()}</strong> this {isPub ? "publication" : "syllabus"}.
                {actionType === "Approved" && " This will mark it as officially approved."}
              </Alert>
              {needsRemarks && (
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    {actionType === "Approved" ? "Optional remarks" : "Reason / Feedback *"}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    className="glass-input shadow-none"
                    placeholder="Enter your remarks..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                </Form.Group>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          {!viewMode && (
            <Button
              variant={actionType === "Approved" ? "success" : actionType === "Rejected" ? "danger" : "info"}
              className="text-white fw-bold px-4"
              onClick={handleConfirm}
              disabled={needsRemarks && !remarks.trim()}
            >
              Confirm {actionType}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function HODApprovals() {
  const [publications, setPublications] = useState([]);
  const [syllabi, setSyllabi] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchAll = useCallback(async () => {
    const [pubs, syls] = await Promise.all([
      API.get("/publications/all"),
      API.get("/syllabus/all")
    ]);
    setPublications(pubs.data.data || []);
    setSyllabi(syls.data.data || []);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePublicationAction = async (id, status, remarks) => {
    try {
      await API.put(`/publications/review/${id}`, { status, remarks });
      setSuccessMsg(`Publication ${status.toLowerCase()} successfully.`);
      fetchAll();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) { alert("Error updating publication"); }
  };

  const handleSyllabusAction = async (id, status, remarks) => {
    try {
      await API.put(`/syllabus/review/${id}`, { status, remarks });
      setSuccessMsg(`Syllabus ${status.toLowerCase()} successfully.`);
      fetchAll();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) { alert("Error updating syllabus"); }
  };

  const filteredPubs = filter === "all" ? publications : publications.filter(p => p.status === filter);
  const filteredSyls = filter === "all" ? syllabi : syllabi.filter(s => s.status === filter);
  const pendingCount = publications.filter(p => p.status === "Pending").length + syllabi.filter(s => s.status === "Pending").length;

  return (
    <Container className="mt-4 fade-in-up">
      {/* Header */}
      <div className="glass-card p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-bolder m-0">HOD <span className="gradient-text">Approval Centre</span></h2>
          <p className="m-0 mt-1" style={{ color: "var(--text-muted)" }}>Review and approve faculty submissions</p>
        </div>
        {pendingCount > 0 && (
          <Badge bg="warning" text="dark" className="px-4 py-2 rounded-pill fs-6 shadow">
            <Clock size={14} className="me-1" /> {pendingCount} Pending Review
          </Badge>
        )}
      </div>

      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        {[
          { label: "Total Publications", value: publications.length, icon: <FileText size={22} />, color: "primary" },
          { label: "Total Syllabi", value: syllabi.length, icon: <BookOpen size={22} />, color: "info" },
          { label: "Pending", value: pendingCount, icon: <Clock size={22} />, color: "warning" },
          { label: "Approved", value: publications.filter(p => p.status === "Approved").length + syllabi.filter(s => s.status === "Approved").length, icon: <CheckCircle size={22} />, color: "success" },
        ].map((item, i) => (
          <Col md={3} key={i}>
            <Card className={`glass-card text-center border-top border-${item.color} border-4 h-100`}>
              <Card.Body className="py-3">
                <div className={`text-${item.color} mb-1`}>{item.icon}</div>
                <h3 className={`fw-bold text-${item.color} mb-0`}>{item.value}</h3>
                <small style={{ color: "var(--text-muted)" }}>{item.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["Pending", "Approved", "Rejected", "Correction Requested", "Update Requested", "all"].map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "primary" : "outline-secondary"}
            className="rounded-pill px-3 fw-semibold"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      <Tabs defaultActiveKey="publications" className="mb-4">
        {/* Publications Tab */}
        <Tab eventKey="publications" title={`📄 Publications (${filteredPubs.length})`}>
          <div className="mt-3">
            {filteredPubs.length === 0 ? (
              <Alert variant="info">No publications found for the selected filter.</Alert>
            ) : (
              filteredPubs.map(p => (
                <ApprovalCard key={p._id} item={p} type="publication" onAction={handlePublicationAction} />
              ))
            )}
          </div>
        </Tab>

        {/* Syllabi Tab */}
        <Tab eventKey="syllabi" title={`📚 Syllabi (${filteredSyls.length})`}>
          <div className="mt-3">
            {filteredSyls.length === 0 ? (
              <Alert variant="info">No syllabus submissions found for the selected filter.</Alert>
            ) : (
              filteredSyls.map(s => (
                <ApprovalCard key={s._id} item={s} type="syllabus" onAction={handleSyllabusAction} />
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}
