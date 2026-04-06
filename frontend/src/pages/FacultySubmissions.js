import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Alert, Tab, Tabs } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";
import { Send, BookOpen } from "lucide-react";

const statusColors = {
  "Pending": "warning",
  "Approved": "success",
  "Rejected": "danger",
  "Correction Requested": "info",
  "Update Requested": "info"
};

export default function FacultySubmissions() {
  const [pubForm, setPubForm] = useState({ title: "", journal: "", author: "", year: "" });
  const [sylForm, setSylForm] = useState({ courseName: "", syllabus: "", coPoMapping: "" });
  const [myPubs, setMyPubs] = useState([]);
  const [mySyllabi, setMySyllabi] = useState([]);
  const [pubMsg, setPubMsg] = useState(null);
  const [sylMsg, setSylMsg] = useState(null);

  const fetchMyData = async () => {
    const [pubs, syllabi] = await Promise.all([
      API.get("/publications/my"),
      API.get("/syllabus/my")
    ]);
    setMyPubs(pubs.data);
    setMySyllabi(syllabi.data);
  };

  useEffect(() => { fetchMyData(); }, []);

  const submitPublication = async () => {
    try {
      if (!pubForm.title || !pubForm.journal || !pubForm.author) {
        setPubMsg({ type: "danger", text: "Please fill in all required fields." });
        return;
      }
      await API.post("/publications/submit", pubForm);
      setPubMsg({ type: "success", text: "Publication submitted successfully! Awaiting HOD review." });
      setPubForm({ title: "", journal: "", author: "", year: "" });
      fetchMyData();
      setTimeout(() => setPubMsg(null), 4000);
    } catch (e) {
      setPubMsg({ type: "danger", text: "Error submitting publication." });
    }
  };

  const submitSyllabus = async () => {
    try {
      if (!sylForm.courseName || !sylForm.syllabus) {
        setSylMsg({ type: "danger", text: "Please fill in Course Name and Syllabus." });
        return;
      }
      await API.post("/syllabus/submit", sylForm);
      setSylMsg({ type: "success", text: "Syllabus submitted successfully! Awaiting HOD review." });
      setSylForm({ courseName: "", syllabus: "", coPoMapping: "" });
      fetchMyData();
      setTimeout(() => setSylMsg(null), 4000);
    } catch (e) {
      setSylMsg({ type: "danger", text: "Error submitting syllabus." });
    }
  };

  return (
    <Container className="mt-4 fade-in-up">
      <div className="glass-card p-4 mb-4">
        <h2 className="fw-bolder m-0">Faculty <span className="gradient-text">Submissions</span></h2>
        <p className="m-0 mt-1" style={{ color: "var(--text-muted)" }}>Submit publications and syllabi for HOD approval</p>
      </div>

      <Tabs defaultActiveKey="publications" className="mb-4 nav-tabs-glass">
        {/* ── PUBLICATIONS TAB ── */}
        <Tab eventKey="publications" title="📄 Publication Approval">
          <Row className="g-4 mt-1">
            {/* Submit Form */}
            <Col lg={5}>
              <Card className="glass-card">
                <Card.Body className="p-4">
                  <h5 className="fw-bolder mb-1">Submit Publication</h5>
                  <p className="mb-4" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    "A new faculty publication has been submitted. Please review the publication details and approve or reject the submission."
                  </p>

                  {pubMsg && <Alert variant={pubMsg.type} className="py-2">{pubMsg.text}</Alert>}

                  <FloatingLabel label="Publication Title *" className="mb-3 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" placeholder="Title" value={pubForm.title} onChange={e => setPubForm({ ...pubForm, title: e.target.value })} />
                  </FloatingLabel>
                  <FloatingLabel label="Journal / Conference Name *" className="mb-3 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" placeholder="Journal" value={pubForm.journal} onChange={e => setPubForm({ ...pubForm, journal: e.target.value })} />
                  </FloatingLabel>
                  <FloatingLabel label="Author(s) *" className="mb-3 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" placeholder="Author names" value={pubForm.author} onChange={e => setPubForm({ ...pubForm, author: e.target.value })} />
                  </FloatingLabel>
                  <FloatingLabel label="Publication Year" className="mb-4 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" type="number" placeholder="2024" value={pubForm.year} onChange={e => setPubForm({ ...pubForm, year: e.target.value })} />
                  </FloatingLabel>

                  <Button className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={submitPublication}>
                    <Send size={16} /> Submit for HOD Review
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* My Publications Status */}
            <Col lg={7}>
              <Card className="glass-card">
                <Card.Body className="p-4">
                  <h5 className="fw-bolder mb-4">My Publication Submissions</h5>
                  {myPubs.length === 0 ? (
                    <Alert variant="info">No publications submitted yet.</Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0" style={{ backgroundColor: "transparent" }}>
                        <thead>
                          <tr>
                            <th className="border-0">Title</th>
                            <th className="border-0">Journal</th>
                            <th className="border-0">Year</th>
                            <th className="border-0">Status</th>
                            <th className="border-0">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myPubs.map(p => (
                            <tr key={p._id} style={{ backgroundColor: "transparent" }}>
                              <td className="fw-medium" style={{ maxWidth: "150px" }}>{p.title}</td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{p.journal}</td>
                              <td>{p.year || "—"}</td>
                              <td><Badge bg={statusColors[p.status]} className="rounded-pill px-3">{p.status}</Badge></td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.82rem", maxWidth: "140px" }}>{p.remarks || "—"}</td>
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
        </Tab>

        {/* ── SYLLABUS TAB ── */}
        <Tab eventKey="syllabus" title="📚 Syllabus Approval">
          <Row className="g-4 mt-1">
            {/* Submit Form */}
            <Col lg={5}>
              <Card className="glass-card">
                <Card.Body className="p-4">
                  <h5 className="fw-bolder mb-1">Submit Course Syllabus</h5>
                  <p className="mb-4" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    "A new course syllabus has been uploaded by faculty. Please review the syllabus and approve it for academic use."
                  </p>

                  {sylMsg && <Alert variant={sylMsg.type} className="py-2">{sylMsg.text}</Alert>}

                  <FloatingLabel label="Course Name *" className="mb-3 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" placeholder="Course Name" value={sylForm.courseName} onChange={e => setSylForm({ ...sylForm, courseName: e.target.value })} />
                  </FloatingLabel>
                  <FloatingLabel label="Syllabus Content *" className="mb-3 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" as="textarea" style={{ height: "120px" }} placeholder="Describe the syllabus topics..." value={sylForm.syllabus} onChange={e => setSylForm({ ...sylForm, syllabus: e.target.value })} />
                  </FloatingLabel>
                  <FloatingLabel label="CO-PO Mapping" className="mb-4 floating-label-custom">
                    <Form.Control className="glass-input shadow-none" as="textarea" style={{ height: "80px" }} placeholder="e.g. CO1→PO1, CO2→PO3..." value={sylForm.coPoMapping} onChange={e => setSylForm({ ...sylForm, coPoMapping: e.target.value })} />
                  </FloatingLabel>

                  <Button className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={submitSyllabus}>
                    <BookOpen size={16} /> Submit for HOD Review
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* My Syllabus Status */}
            <Col lg={7}>
              <Card className="glass-card">
                <Card.Body className="p-4">
                  <h5 className="fw-bolder mb-4">My Syllabus Submissions</h5>
                  {mySyllabi.length === 0 ? (
                    <Alert variant="info">No syllabi submitted yet.</Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0" style={{ backgroundColor: "transparent" }}>
                        <thead>
                          <tr>
                            <th className="border-0">Course</th>
                            <th className="border-0">Status</th>
                            <th className="border-0">HOD Remarks</th>
                            <th className="border-0">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mySyllabi.map(s => (
                            <tr key={s._id} style={{ backgroundColor: "transparent" }}>
                              <td className="fw-medium">{s.courseName}</td>
                              <td><Badge bg={statusColors[s.status]} className="rounded-pill px-3">{s.status}</Badge></td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.82rem", maxWidth: "150px" }}>{s.remarks || "—"}</td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
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
        </Tab>
      </Tabs>
    </Container>
  );
}
