import { Container, Form, Button, Card, Row, Col, FloatingLabel, Table, Badge, Modal } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Edit3 } from "lucide-react";
import { toast } from "react-toastify";

export default function Faculty() {
  const [d, setD] = useState({ name: "", qualification: "", publications: "", teachingWorkload: "", department: "Computer Science (CSE)" });
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  const depts = ["Computer Science (CSE)", "Information Technology (IT)", "Electronics (ECE)", "Mechanical (MECH)"];

  const fetchData = useCallback(async () => {
    try {
      let url = "/faculty";
      if (filterDept !== "All") url += `?department=${encodeURIComponent(filterDept)}`;
      const res = await API.get(url);
      setList(res.data);
    } catch (e) {
      toast.error("Error loading faculty");
    }
  }, [filterDept]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await API.put(`/faculty/${editId}`, d);
        toast.success("Faculty record updated!");
      } else {
        await API.post("/faculty", d);
        toast.success("Faculty added successfully!");
      }
      resetForm();
      fetchData();
    } catch (e) {
      toast.error("Error saving record");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setD({ 
      name: item.name, 
      qualification: item.qualification, 
      publications: item.publications, 
      teachingWorkload: item.teachingWorkload,
      department: item.department || depts[0]
    });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await API.delete(`/faculty/${deleteId}`);
      setShowDeleteModal(false);
      fetchData();
      toast.success("Record deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setD({ name: "", qualification: "", publications: "", teachingWorkload: "", department: depts[0] });
  };

  return (
    <Container className="mt-4 fade-in-up">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="glass-card sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h4 className="fw-bolder mb-4">
                {isEditing ? <span className="gradient-text">Edit</span> : <span className="gradient-text">Add</span>} Faculty
              </h4>

              <FloatingLabel label="Full Name" className="mb-3 floating-label-custom">
                <Form.Control className="glass-input shadow-none" placeholder="Dr. John Doe" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} />
              </FloatingLabel>

              <FloatingLabel label="Department" className="mb-3 floating-label-custom">
                <Form.Select className="glass-input shadow-none" value={d.department} onChange={e => setD({ ...d, department: e.target.value })}>
                  {depts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </Form.Select>
              </FloatingLabel>

              <FloatingLabel label="Qualification" className="mb-3 floating-label-custom">
                <Form.Control className="glass-input shadow-none" placeholder="Ph.D. Computer Science" value={d.qualification} onChange={e => setD({ ...d, qualification: e.target.value })} />
              </FloatingLabel>

              <Row className="g-2 mb-4">
                <Col md={5}>
                  <FloatingLabel label="Pubs Count" className="floating-label-custom">
                    <Form.Control className="glass-input shadow-none" type="number" value={d.publications} onChange={e => setD({ ...d, publications: e.target.value })} />
                  </FloatingLabel>
                </Col>
                <Col md={7}>
                  <FloatingLabel label="Workload" className="floating-label-custom">
                    <Form.Control className="glass-input shadow-none" value={d.teachingWorkload} onChange={e => setD({ ...d, teachingWorkload: e.target.value })} />
                  </FloatingLabel>
                </Col>
              </Row>

              <Button className="w-100 py-2 fw-bold" onClick={handleSave}>
                {isEditing ? "Update Record" : "Save Faculty"}
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
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h4 className="fw-bolder m-0">Faculty <span className="gradient-text">Academic Audit</span></h4>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                   <Form.Select size="sm" className="glass-input shadow-none w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                      <option value="All">All Departments</option>
                      {depts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </Form.Select>
                  <div className="position-relative">
                    <Search className="position-absolute translate-middle-y text-muted" size={16} style={{ top: '50%', left: '10px' }} />
                    <Form.Control size="sm" className="glass-input shadow-none ps-5" placeholder="Search name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th className="border-0">Faculty Info</th>
                      <th className="border-0">Audit Details</th>
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
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Badge bg="primary" className="rounded-pill px-2">{item.qualification}</Badge>
                            <Badge bg="success" className="rounded-pill px-2">Pubs: {item.publications || 0}</Badge>
                            <Badge bg="secondary" className="rounded-pill px-2">{item.teachingWorkload || "N/A"}</Badge>
                          </div>
                        </td>
                        <td className="text-end">
                           <Button variant="outline-warning" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEdit(item)}><Edit3 size={14} /></Button>
                           <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => confirmDelete(item._id)}><Trash2 size={14} /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Record</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to remove this faculty record?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Remove</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}