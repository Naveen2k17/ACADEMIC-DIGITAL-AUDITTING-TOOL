import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Modal } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";
import { Search, GraduationCap, Trash2, Edit3, X, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function Students() {
  const [d, setD] = useState({ name: "", attendance: "", credits: "", results: "", department: "Computer Science (CSE)", year: "1" });
  const [list, setList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentTotalPages, setAssignmentTotalPages] = useState(1);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const role = localStorage.getItem("role");

  const depts = ["Computer Science (CSE)", "Information Technology (IT)", "Electronics (ECE)", "Mechanical (MECH)"];

  const fetchData = async () => {
    try {
      let url = "/students";
      const params = new URLSearchParams();
      if (filterDept !== "All") params.append("department", filterDept);
      if (filterYear !== "All") params.append("year", filterYear);
      params.append("page", page);
      params.append("limit", 10);
      
      const res = await API.get(`${url}?${params.toString()}`);
      setList(res.data.data || []);
      setTotalPages(res.data.pages || 1);

      if (role === "Student") {
        fetchAssignments();
      }
    } catch (e) {
      toast.error("Error loading data");
    }
  };

  const fetchAssignments = async () => {
    try {
      const aRes = await API.get(`/assignments/my?page=${assignmentPage}&limit=5`);
      setAssignments(aRes.data.data || []);
      setAssignmentTotalPages(aRes.data.pages || 1);
    } catch (e) {
      toast.error("Error loading assignments");
    }
  };

  useEffect(() => { fetchData(); }, [filterDept, filterYear, page]);
  useEffect(() => { if (role === "Student") fetchAssignments(); }, [assignmentPage]);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await API.put(`/students/${editId}`, d);
        toast.success("Student updated!");
      } else {
        await API.post("/students", d);
        toast.success("Student added!");
      }
      resetForm();
      fetchData();
    } catch (e) { toast.error("Error saving record"); }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setD({ 
      name: item.name, 
      attendance: item.attendance, 
      credits: item.credits, 
      results: item.results || "",
      department: item.department || depts[0],
      year: item.year || "1"
    });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await API.delete(`/students/${deleteId}`);
      setShowDeleteModal(false);
      fetchData();
      toast.success("Deleted successfully!");
    } catch (e) { toast.error("Delete failed"); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setD({ name: "", attendance: "", credits: "", results: "", department: depts[0], year: "1" });
  };

  return (
    <Container className="mt-4 fade-in-up">
      <Row className="g-4">
        {role !== "Student" && (
          <Col lg={4}>
            <Card className="glass-card sticky-top" style={{ top: '100px' }}>
              <Card.Body className="p-4">
                <h4 className="fw-bolder mb-4">
                  {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Add</span>} Student
                </h4>

                <FloatingLabel label="Student Name" className="mb-3 floating-label-custom">
                  <Form.Control className="glass-input shadow-none" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} />
                </FloatingLabel>

                <Row className="g-2 mb-3">
                  <Col md={7}>
                    <FloatingLabel label="Department" className="floating-label-custom">
                      <Form.Select className="glass-input shadow-none" value={d.department} onChange={e => setD({ ...d, department: e.target.value })}>
                        {depts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col md={5}>
                    <FloatingLabel label="Year" className="floating-label-custom">
                      <Form.Select className="glass-input shadow-none" value={d.year} onChange={e => setD({ ...d, year: e.target.value })}>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                </Row>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <FloatingLabel label="Attendance %" className="floating-label-custom">
                      <Form.Control className="glass-input shadow-none" type="number" value={d.attendance} onChange={e => setD({ ...d, attendance: e.target.value })} />
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel label="Credits" className="floating-label-custom">
                      <Form.Control className="glass-input shadow-none" type="number" value={d.credits} onChange={e => setD({ ...d, credits: e.target.value })} />
                    </FloatingLabel>
                  </Col>
                </Row>

                <FloatingLabel label="Results / Grade" className="mb-4 floating-label-custom">
                  <Form.Control className="glass-input shadow-none" value={d.results} onChange={e => setD({ ...d, results: e.target.value })} />
                </FloatingLabel>

                <Button className="w-100 py-2 fw-bold" onClick={handleSave}>
                  {isEditing ? "Update Student" : "Save Record"}
                </Button>
                {isEditing && (
                  <Button variant="outline-secondary" className="w-100 mt-2 py-2" onClick={resetForm}>Cancel</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        <Col lg={role === "Student" ? 12 : 8}>
          <Card className="glass-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h4 className="fw-bolder m-0">
                  {role === "Student" ? "My" : "Student"} <span className="gradient-text">Academic Audit</span>
                </h4>
                {role !== "Student" && (
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <Form.Select size="sm" className="glass-input shadow-none w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                      <option value="All">All Departments</option>
                      {depts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </Form.Select>
                    <Form.Select size="sm" className="glass-input shadow-none w-auto" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                      <option value="All">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </Form.Select>
                    <div className="position-relative">
                      <Search className="position-absolute translate-middle-y text-muted" size={16} style={{ top: '50%', left: '10px' }} />
                      <Form.Control size="sm" className="glass-input shadow-none ps-5" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th className="border-0">Student Info</th>
                      <th className="border-0">Year</th>
                      <th className="border-0">Overall Compliance</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="fw-bold">{item.name}</div>
                          <div className="small text-muted">{item.department}</div>
                        </td>
                        <td><Badge bg="info" className="rounded-pill px-3">{item.year}{item.year === 1 ? "st" : item.year === 2 ? "nd" : item.year === 3 ? "rd" : "th"}</Badge></td>
                        <td>
                          <div className="d-flex gap-2">
                             <Badge bg={item.attendance < 75 ? "danger" : "success"} className="rounded-pill px-2">Avg Att: {item.attendance}%</Badge>
                             <Badge bg="primary" className="rounded-pill px-2">Cr: {item.credits}</Badge>
                             <Badge bg="secondary" className="rounded-pill px-2">{item.results || "N/A"}</Badge>
                          </div>
                        </td>
                        <td className="text-end">
                          {role !== "Student" && (
                            <>
                              <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(item)}><Edit3 size={14} /></Button>
                              <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => confirmDelete(item._id)}><Trash2 size={14} /></Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination for Students List */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <Button variant="outline-primary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <span className="align-self-center mx-2 text-muted small">Page {page} of {totalPages}</span>
                  <Button variant="outline-primary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {role === "Student" && (
            <Card className="glass-card mt-4">
              <Card.Body className="p-4">
                <h4 className="fw-bolder mb-4">My <span className="gradient-text">Assigned Courses</span></h4>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr>
                        <th className="border-0">Course Name</th>
                        <th className="border-0">Faculty</th>
                        <th className="border-0">Attendance</th>
                        <th className="border-0">Grade</th>
                        <th className="border-0">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => {
                        const me = a.students.find(s => s.studentName === localStorage.getItem("name"));
                        return (
                          <tr key={a._id} style={{ backgroundColor: 'transparent' }}>
                            <td className="fw-bold">{a.courseName}</td>
                            <td>{a.facultyName}</td>
                            <td>
                              <Badge bg={(me?.attendance || 0) < 75 ? "danger" : "success"} className="rounded-pill px-3">
                                {me?.attendance || 0}%
                              </Badge>
                            </td>
                            <td>
                                <Badge bg="info" className="rounded-pill px-3">{me?.grade || "N/A"}</Badge>
                            </td>
                            <td className="text-muted small">{a.semester} ({a.section})</td>
                          </tr>
                        );
                      })}
                      {assignments.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No assignments found</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination for Assignments */}
                {assignmentTotalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <Button variant="outline-primary" size="sm" disabled={assignmentPage === 1} onClick={() => setAssignmentPage(assignmentPage - 1)}>Previous</Button>
                    <span className="align-self-center mx-2 text-muted small">Page {assignmentPage} of {assignmentTotalPages}</span>
                    <Button variant="outline-primary" size="sm" disabled={assignmentPage === assignmentTotalPages} onClick={() => setAssignmentPage(assignmentPage + 1)}>Next</Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Record</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}