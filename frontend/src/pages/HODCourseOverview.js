import { Container, Card, Row, Col, Table, Badge, Alert, Modal, Button } from "react-bootstrap";
import API from "../services/api";
import { useState, useEffect } from "react";
import { Users, BookOpen, TrendingUp, Award, Eye, Download, FileText } from "lucide-react";
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

export default function HODCourseOverview() {
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    API.get(`/assignments/all?page=${page}&limit=10`)
      .then(res => { 
        setAssignments(res.data.data || []); 
        setTotalPages(res.data.pages || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [page]);

  const totalStudents = assignments.reduce((sum, a) => sum + a.totalStudents, 0);
  const avgAttendanceAll = assignments.length > 0
    ? Math.round(assignments.reduce((sum, a) => sum + a.avgAttendance, 0) / assignments.length)
    : 0;
  const avgPassAll = assignments.length > 0
    ? Math.round(assignments.reduce((sum, a) => sum + a.passPercentage, 0) / assignments.length)
    : 0;

  const getAttColor = (val) => val >= 75 ? "success" : val >= 60 ? "warning" : "danger";
  const getPassColor = (val) => val >= 70 ? "success" : val >= 50 ? "warning" : "danger";

  // PDF Generation
  const downloadPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const today = new Date().toLocaleDateString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("Academic Audit Report", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on: ${today}`, 14, 28);
      doc.text("Department Management System", 14, 34);

      // Summary Box
      doc.setDrawColor(200);
      doc.setFillColor(245, 247, 250);
      doc.rect(14, 40, 269, 20, 'F');
      doc.setTextColor(40);
      doc.setFontSize(10);
      doc.text(`Total Courses: ${assignments.length}    Total Students: ${totalStudents}    Avg Attendance: ${avgAttendanceAll}%    Avg Pass %: ${avgPassAll}%`, 20, 52);

      // Table
      const tableHeaders = [["Course Name", "Faculty", "Sem", "Sec", "Total", "Att %", "Pass %", "Credits"]];
      const tableData = assignments.map(a => [
        a.courseName, a.facultyName, a.semester, a.section || "-", a.totalStudents, 
        `${a.avgAttendance}%`, `${a.passPercentage}%`, `${a.creditCompletion}/${a.totalStudents}`
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255], textColor: 255 },
        styles: { fontSize: 9 }
      });

      doc.save(`Academic_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF Audit Report downloaded!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF: " + err.message);
    }
  };

  const downloadCSV = () => {
    const headers = ["Course Name", "Faculty Name", "Semester", "Section", "Total Students", "Avg Attendance%", "Pass %", "Credit Completion"];
    const rows = assignments.map(a => [
      a.courseName, a.facultyName, a.semester, a.section || "N/A",
      a.totalStudents, `${a.avgAttendance}%`, `${a.passPercentage}%`, `${a.creditCompletion}/${a.totalStudents}`
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Course_Overview_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <Container className="mt-5 text-center fade-in-up">
      <div className="glass-card p-5">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p style={{ color: "var(--text-muted)" }}>Loading course overview...</p>
      </div>
    </Container>
  );

  return (
    <Container className="mt-4 fade-in-up">
      {/* Header */}
      <div className="glass-card p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-bolder m-0">Course <span className="gradient-text">Overview</span></h2>
          <p className="m-0 mt-1" style={{ color: "var(--text-muted)" }}>
            Faculty-wise course performance and student statistics
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" className="rounded-pill px-4 d-flex align-items-center gap-2 fw-bold" onClick={downloadCSV}>
            <Download size={18} /> Export CSV
          </Button>
          <Button variant="primary" className="rounded-pill px-4 d-flex align-items-center gap-2 fw-bold" onClick={downloadPDF}>
            <FileText size={18} /> Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        {[
          { icon: <BookOpen size={22} />, label: "Total Courses Assigned", value: assignments.length, color: "primary" },
          { icon: <Users size={22} />, label: "Total Students Enrolled", value: totalStudents, color: "success" },
          { icon: <TrendingUp size={22} />, label: "Avg Attendance", value: `${avgAttendanceAll}%`, color: avgAttendanceAll >= 75 ? "success" : "warning" },
          { icon: <Award size={22} />, label: "Avg Pass Percentage", value: `${avgPassAll}%`, color: avgPassAll >= 70 ? "success" : "warning" },
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

      {/* Performance Chart */}
      <Card className="glass-card mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bolder mb-4">Performance <span className="gradient-text">Analytics</span> (Course-wise)</h5>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <ComposedChart data={assignments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="courseName" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '15px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="passPercentage" name="Pass %" fill="#8884d8" stroke="#8884d8" fillOpacity={0.1} />
                <Bar dataKey="avgAttendance" name="Avg Attendance" barSize={30} fill="#413ea0" radius={[10, 10, 0, 0]} />
                <Line type="monotone" dataKey="totalStudents" name="Students" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="glass-card">
        <Card.Body className="p-4">
          <h5 className="fw-bolder mb-4">Course-wise Faculty Performance</h5>

          {assignments.length === 0 ? (
            <Alert variant="info">
              No course assignments found. Faculty members need to assign students to courses first.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ backgroundColor: "transparent" }}>
                <thead>
                  <tr>
                    <th className="border-0">Course Name</th>
                    <th className="border-0">Faculty Name</th>
                    <th className="border-0">Semester</th>
                    <th className="border-0">Section</th>
                    <th className="border-0">Total Students</th>
                    <th className="border-0">Avg Attendance</th>
                    <th className="border-0">Pass %</th>
                    <th className="border-0">Credit Completion</th>
                    <th className="border-0 text-end">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a._id} style={{ backgroundColor: "transparent" }}>
                      <td className="fw-medium">{a.courseName}</td>
                      <td style={{ color: "var(--text-muted)" }}>{a.facultyName}</td>
                      <td>
                        <Badge bg="primary" className="rounded-pill px-2" style={{ fontSize: "0.75rem" }}>
                          {a.semester}
                        </Badge>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{a.section || "—"}</td>
                      <td>
                        <Badge bg="secondary" className="rounded-pill px-3">{a.totalStudents}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px", minWidth: "60px" }}>
                            <div
                              className={`progress-bar bg-${getAttColor(a.avgAttendance)}`}
                              style={{ width: `${a.avgAttendance}%` }}
                            />
                          </div>
                          <Badge bg={getAttColor(a.avgAttendance)} className="rounded-pill px-2">
                            {a.avgAttendance}%
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px", minWidth: "60px" }}>
                            <div
                              className={`progress-bar bg-${getPassColor(a.passPercentage)}`}
                              style={{ width: `${a.passPercentage}%` }}
                            />
                          </div>
                          <Badge bg={getPassColor(a.passPercentage)} className="rounded-pill px-2">
                            {a.passPercentage}%
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <Badge bg={a.creditCompletion === a.totalStudents ? "success" : "warning"} className="rounded-pill px-3">
                          {a.creditCompletion} / {a.totalStudents}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill px-3 d-inline-flex align-items-center gap-1 fw-semibold"
                          onClick={() => { setSelectedAssignment(a); setShowStudents(true); }}
                        >
                          <Eye size={14} /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="outline-primary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="align-self-center mx-2 text-muted small">Page {page} of {totalPages}</span>
              <Button variant="outline-primary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Student Detail Modal */}
      <Modal show={showStudents} onHide={() => setShowStudents(false)} centered size="lg">
        <Modal.Header closeButton style={{ border: "none" }}>
          <Modal.Title className="fw-bolder">
            {selectedAssignment?.courseName}
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal", marginTop: "2px" }}>
              Faculty: {selectedAssignment?.facultyName} · {selectedAssignment?.semester}
              {selectedAssignment?.section ? ` · Section ${selectedAssignment.section}` : ""}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Row className="g-3 mb-4">
            {[
              { label: "Total Students", value: selectedAssignment?.totalStudents, color: "primary" },
              { label: "Avg Attendance", value: `${selectedAssignment?.avgAttendance}%`, color: getAttColor(selectedAssignment?.avgAttendance || 0) },
              { label: "Pass Percentage", value: `${selectedAssignment?.passPercentage}%`, color: getPassColor(selectedAssignment?.passPercentage || 0) },
              { label: "Credit Completion", value: `${selectedAssignment?.creditCompletion}/${selectedAssignment?.totalStudents}`, color: "info" },
            ].map((item, i) => (
              <Col xs={6} key={i}>
                <div className={`p-3 rounded text-center border border-${item.color}`} style={{ background: "rgba(0,0,0,0.03)" }}>
                  <div className={`fw-bold fs-4 text-${item.color}`}>{item.value}</div>
                  <small style={{ color: "var(--text-muted)" }}>{item.label}</small>
                </div>
              </Col>
            ))}
          </Row>

          <h6 className="fw-bolder mb-3">Enrolled Students</h6>
          {selectedAssignment?.students?.length === 0 ? (
            <Alert variant="info">No students enrolled.</Alert>
          ) : (
            <Table hover size="sm" className="align-middle" style={{ backgroundColor: "transparent" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {selectedAssignment?.students?.map((s, i) => (
                  <tr key={s.studentId} style={{ backgroundColor: "transparent" }}>
                    <td>{i + 1}</td>
                    <td className="fw-medium">{s.studentName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="secondary" onClick={() => setShowStudents(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
