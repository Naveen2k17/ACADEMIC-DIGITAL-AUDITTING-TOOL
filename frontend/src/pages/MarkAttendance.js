import { Container, Table, Button, Form, ProgressBar, Row, Col, Card, FloatingLabel } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

export default function MarkAttendance() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({});
  const [grades, setGrades] = useState({});

  useEffect(() => {
    API.get("/assignments/my").then(res => setAssignments(res.data.data || []));
  }, []);

  const handleAssignmentChange = (e) => {
    const id = e.target.value;
    const assignment = assignments.find(a => a._id === id);
    setSelectedAssignment(assignment);
    setStudents(assignment ? assignment.students : []);
  };

  const saveAttendance = async (studentId) => {
    const val = values[studentId];
    if (val === undefined) {
      toast.error("Enter attendance value");
      return;
    }

    try {
      await API.put("/assignments/mark-attendance", {
        assignmentId: selectedAssignment._id,
        studentId: studentId,
        attendance: val
      });
      toast.success("Attendance Updated");
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, attendance: val } : s));
    } catch (e) {
      toast.error("Failed to update attendance");
    }
  };

  const saveGrade = async (studentId) => {
    const grade = grades[studentId];
    if (!grade) {
      toast.error("Enter grade");
      return;
    }

    try {
      await API.put("/assignments/mark-grade", {
        assignmentId: selectedAssignment._id,
        studentId: studentId,
        grade: grade
      });
      toast.success("Grade Updated");
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, grade: grade } : s));
    } catch (e) {
      toast.error("Failed to update grade");
    }
  };

  return (
    <Container className="mt-4 fade-in-up">
      <Card className="glass-card mb-4">
        <Card.Body className="p-4">
          <h4 className="fw-bolder mb-4">Mark <span className="gradient-text">Course Attendance & Grades</span></h4>
          <Row>
            <Col md={6}>
              <FloatingLabel label="Select Course Assignment" className="mb-3 floating-label-custom">
                <Form.Select className="glass-input shadow-none" onChange={handleAssignmentChange}>
                  <option value="">Choose an assignment...</option>
                  {assignments.map(a => (
                    <option key={a._id} value={a._id}>{a.courseName} - {a.semester} ({a.section})</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {selectedAssignment && (
        <Card className="glass-card">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Students for {selectedAssignment.courseName}</h5>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr>
                    <th className="border-0">Student Name</th>
                    <th className="border-0">Attendance</th>
                    <th className="border-0">Update Attendance</th>
                    <th className="border-0">Grade</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.studentId}>
                      <td className="fw-bold">{s.studentName}</td>
                      <td style={{ width: "150px" }}>
                        <ProgressBar
                          now={s.attendance || 0}
                          label={`${s.attendance || 0}%`}
                          variant={(s.attendance || 0) < 75 ? "danger" : "success"}
                          className="rounded-pill"
                          style={{ height: "10px" }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          className="glass-input shadow-none w-auto"
                          placeholder="%"
                          onChange={(e) => setValues({ ...values, [s.studentId]: e.target.value })}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="text"
                          className="glass-input shadow-none w-auto"
                          placeholder="Grade"
                          value={grades[s.studentId] || s.grade || ""}
                          onChange={(e) => setGrades({ ...grades, [s.studentId]: e.target.value })}
                        />
                      </td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-success" className="me-2 rounded-pill px-3 fw-bold" onClick={() => saveAttendance(s.studentId)}>Set Att</Button>
                        <Button size="sm" variant="outline-primary" className="rounded-pill px-3 fw-bold" onClick={() => saveGrade(s.studentId)}>Set Grade</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}