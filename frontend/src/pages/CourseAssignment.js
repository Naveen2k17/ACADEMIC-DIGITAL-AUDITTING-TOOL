import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Modal, Alert, InputGroup } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";
import { UserPlus, Eye, Pencil, Trash2, Search, Upload } from "lucide-react";

export default function CourseAssignment() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [form, setForm] = useState({ facultyId: "", facultyName: "", courseName: "", semester: "", section: "", students: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const role = localStorage.getItem("role");

  // View Students Modal
  const [showView, setShowView] = useState(false);
  const [viewAssignment, setViewAssignment] = useState(null);
  // Delete Modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentTotalPages, setAssignmentTotalPages] = useState(1);

  useEffect(() => {
    fetchAll();
  }, [assignmentPage]);

  const fetchAll = async () => {
    try {
      const [c, s, a, f] = await Promise.all([
        API.get("/courses"),
        API.get("/students?limit=1000"), // Fetch more students for the selection list
        API.get(`/assignments/my?page=${assignmentPage}&limit=10`),
        (role === "Admin" || role === "HOD") ? API.get("/admin/faculty") : Promise.resolve({ data: [] })
      ]);
      setCourses(c.data);
      setStudents(s.data.data || []);
      setAssignments(a.data.data || []);
      setAssignmentTotalPages(a.data.pages || 1);
      setFacultyList(f.data);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  const handleStudentToggle = (student) => {
    const already = form.students.find(s => s.studentId === student._id);
    if (already) {
      setForm({ ...form, students: form.students.filter(s => s.studentId !== student._id) });
    } else {
      setForm({ ...form, students: [...form.students, { studentId: student._id, studentName: student.name }] });
    }
  };

  const handleSave = async () => {
    try {
      if (!form.courseName || !form.semester) {
        setMsg({ type: "danger", text: "Course Name and Semester are required." });
        return;
      }
      if (form.students.length === 0) {
        setMsg({ type: "danger", text: "Please select at least one student." });
        return;
      }
      if (isEditing) {
        await API.put(`/assignments/${editId}`, form);
        setMsg({ type: "success", text: "Assignment updated successfully." });
      } else {
        await API.post("/assignments", form);
        setMsg({ type: "success", text: "Students assigned successfully." });
      }
      resetForm();
      fetchAll();
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ type: "danger", text: e.response?.data?.message || "Error saving assignment." });
    }
  };

  const handleEdit = (a) => {
    setIsEditing(true);
    setEditId(a._id);
    setForm({
      facultyId: a.facultyId || "",
      facultyName: a.facultyName || "",
      courseName: a.courseName,
      semester: a.semester,
      section: a.section || "",
      students: a.students
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeIndividualStudent = async (assignmentId, studentId) => {
    if (window.confirm("Remove this student from the course list?")) {
      try {
        await API.delete(`/assignments/${assignmentId}/student/${studentId}`);
        // Update local state for modal
        if (viewAssignment) {
          const updated = { ...viewAssignment, students: viewAssignment.students.filter(s => s.studentId !== studentId) };
          setViewAssignment(updated);
        }
        fetchAll();
      } catch (e) { alert("Error removing student"); }
    }
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDelete(true); };
  const handleDelete = async () => {
    await API.delete(`/assignments/${deleteId}`);
    setShowDelete(false);
    fetchAll();
  };

  const handleBulkUpload = () => {
    const names = bulkText.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== "");
    const found = [];
    names.forEach(name => {
      const match = students.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (match && !form.students.some(fs => fs.studentId === match._id)) {
        found.push({ studentId: match._id, studentName: match.name });
      }
    });
    if (found.length > 0) {
      setForm({ ...form, students: [...form.students, ...found] });
      setBulkText("");
      setMsg({ type: "success", text: `Quick-added ${found.length} students from list.` });
      setTimeout(() => setMsg(null), 3000);
    } else {
      alert("No matching students found in the list.");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ facultyId: "", facultyName: "", courseName: "", semester: "", section: "", students: [] });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (id) => form.students.some(s => s.studentId === id);

  return (
    <Container className="mt-4 fade-in-up">
      <div className="glass-card p-4 mb-4">
        <h2 className="fw-bolder m-0">Course <span className="gradient-text">Assignment</span></h2>
        <p className="m-0 mt-1" style={{ color: "var(--text-muted)" }}>Assign students to courses you handle</p>
      </div>

      <Row className="g-4">
        {/* Assignment Form */}
        <Col lg={5}>
          <Card className="glass-card sticky-top" style={{ top: "100px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bolder mb-4">
                {isEditing ? <><span className="gradient-text">Edit</span> Assignment</> : <><span className="gradient-text">Assign</span> Students</>}
              </h5>

              {msg && <Alert variant={msg.type} className="py-2 mb-3">{msg.text}</Alert>}

              {/* Faculty Select for Admin/HOD */}
              {(role === "Admin" || role === "HOD") && (
                <FloatingLabel label="Select Faculty *" className="mb-3 floating-label-custom">
                  <Form.Select
                    className="glass-input shadow-none"
                    value={form.facultyId}
                    onChange={e => {
                      const f = facultyList.find(x => x._id === e.target.value);
                      setForm({ ...form, facultyId: e.target.value, facultyName: f ? f.name : "" });
                    }}
                    disabled={isEditing}
                  >
                    <option value="">Select faculty member...</option>
                    {facultyList.map(f => (
                      <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              )}

              {/* Course Select */}
              <FloatingLabel label="Course Name *" className="mb-3 floating-label-custom">
                <Form.Select
                  className="glass-input shadow-none"
                  value={form.courseName}
                  onChange={e => setForm({ ...form, courseName: e.target.value })}
                  disabled={isEditing}
                >
                  <option value="">Select a course...</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.courseName}>{c.courseName}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>

              {/* Semester */}
              <FloatingLabel label="Semester *" className="mb-3 floating-label-custom">
                <Form.Select
                  className="glass-input shadow-none"
                  value={form.semester}
                  onChange={e => setForm({ ...form, semester: e.target.value })}
                >
                  <option value="">Select semester...</option>
                  {["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>

              {/* Section */}
              <FloatingLabel label="Section (Optional)" className="mb-3 floating-label-custom">
                <Form.Control
                  className="glass-input shadow-none"
                  placeholder="e.g. A, B, C"
                  value={form.section}
                  onChange={e => setForm({ ...form, section: e.target.value })}
                />
              </FloatingLabel>

              {/* Student Multi-select with Search */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2">
                  Student List * <Badge bg="primary" className="rounded-pill ms-2">{form.students.length} selected</Badge>
                </Form.Label>
                
                <InputGroup className="mb-2">
                  <InputGroup.Text className="glass-input border-0 text-muted"><Search size={16} /></InputGroup.Text>
                  <Form.Control 
                    className="glass-input shadow-none" 
                    placeholder="Search students..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.05)", maxHeight: "180px", overflowY: "auto" }}>
                  {filteredStudents.length === 0 ? (
                    <small style={{ color: "var(--text-muted)" }}>No students match your search.</small>
                  ) : (
                    filteredStudents.map(s => (
                      <Form.Check
                        key={s._id}
                        type="checkbox"
                        id={`student-${s._id}`}
                        label={`${s.name} (Att: ${s.attendance}%)`}
                        checked={isSelected(s._id)}
                        onChange={() => handleStudentToggle(s)}
                        className="mb-2"
                      />
                    ))
                  )}
                </div>
              </Form.Group>

              {/* Bulk Upload Section */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-1 small text-muted">Quick Paste student names (separated by commas or newlines)</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control 
                    as="textarea"
                    rows={1}
                    className="glass-input shadow-none"
                    style={{ fontSize: "0.8rem" }}
                    placeholder="John Doe, Jane Smith..."
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                  />
                  <Button variant="outline-primary" size="sm" className="px-3" onClick={handleBulkUpload}>
                    <Upload size={14} />
                  </Button>
                </div>
              </Form.Group>

              <Button className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleSave}>
                <UserPlus size={16} /> {isEditing ? "Update Assignment" : "Assign Students"}
              </Button>
              {isEditing && (
                <Button variant="outline-secondary" className="w-100 mt-2 py-2" onClick={resetForm}>Cancel</Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* My Assignments Table */}
        <Col lg={7}>
          <Card className="glass-card">
            <Card.Body className="p-4">
              <h5 className="fw-bolder mb-4">My <span className="gradient-text">Assignments</span></h5>
              {assignments.length === 0 ? (
                <Alert variant="info">No assignments yet. Use the form to assign students to a course.</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0" style={{ backgroundColor: "transparent" }}>
                    <thead>
                      <tr>
                        <th className="border-0">Course</th>
                        <th className="border-0">Semester</th>
                        <th className="border-0">Section</th>
                        <th className="border-0">Students</th>
                        <th className="border-0 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={a._id} style={{ backgroundColor: "transparent" }}>
                          <td className="fw-medium">{a.courseName}</td>
                          <td><Badge bg="info" className="rounded-pill px-2">{a.semester}</Badge></td>
                          <td style={{ color: "var(--text-muted)" }}>{a.section || "—"}</td>
                          <td><Badge bg="success" className="rounded-pill px-3">{a.students.length}</Badge></td>
                          <td className="text-end">
                            <Button size="sm" variant="outline-primary" className="me-1 rounded-pill px-2" title="View Students"
                              onClick={() => { setViewAssignment(a); setShowView(true); }}>
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="outline-warning" className="me-1 rounded-pill px-2" title="Edit"
                              onClick={() => handleEdit(a)}>
                              <Pencil size={14} />
                            </Button>
                            <Button size="sm" variant="outline-danger" className="rounded-pill px-2" title="Remove"
                              onClick={() => confirmDelete(a._id)}>
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              {/* Pagination for Course Assignments List */}
              {assignmentTotalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <Button variant="outline-primary" size="sm" disabled={assignmentPage === 1} onClick={() => setAssignmentPage(assignmentPage - 1)}>Previous</Button>
                  <span className="align-self-center mx-2 text-muted small">Page {assignmentPage} of {assignmentTotalPages}</span>
                  <Button variant="outline-primary" size="sm" disabled={assignmentPage === assignmentTotalPages} onClick={() => setAssignmentPage(assignmentPage + 1)}>Next</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Students Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton style={{ border: "none" }}>
          <Modal.Title className="fw-bolder">
            Students — {viewAssignment?.courseName}
            <small className="ms-2" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {viewAssignment?.semester} {viewAssignment?.section ? `· Section ${viewAssignment.section}` : ""}
            </small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {viewAssignment?.students.length === 0 ? (
            <Alert variant="info">No students in this assignment.</Alert>
          ) : (
            <Table hover className="align-middle" style={{ backgroundColor: "transparent" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {viewAssignment?.students.map((s, i) => (
                  <tr key={s.studentId} style={{ backgroundColor: "transparent" }}>
                    <td>{i + 1}</td>
                    <td className="fw-medium">{s.studentName}</td>
                    <td className="text-end">
                      <Button variant="link" className="text-danger p-0 border-0" onClick={() => removeIndividualStudent(viewAssignment._id, s.studentId)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="secondary" onClick={() => setShowView(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Whole Assignment Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton><Modal.Title>Remove Whole Assignment</Modal.Title></Modal.Header>
        <Modal.Body>Delete this entire course-faculty-student mapping?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Remove All</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
