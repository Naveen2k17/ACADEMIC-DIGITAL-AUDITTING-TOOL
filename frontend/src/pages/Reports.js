import { Container, Card, Table, Alert, Badge, Button, Row, Col, Form } from "react-bootstrap";
import API from "../services/api";
import { useEffect, useState } from "react";
import { FileText, Download, Users, BookOpen, Building, GraduationCap, BarChart as BarChartIcon, PieChart as PieChartIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [filterModule, setFilterModule] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports");
      setReport(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const downloadCSV = () => {
    if (!report) return;
    try {
      const rows = [];
      rows.push(["=== ACADEMIC AUDIT REPORT ==="]);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([]);

      rows.push(["--- SUMMARY ---"]);
      rows.push(["Metric", "Value"]);
      rows.push(["Total Students", report.summary.totalStudents]);
      rows.push(["Total Faculty", report.summary.totalFaculty]);
      rows.push(["Total Courses", report.summary.totalCourses]);
      rows.push(["Total Infrastructure", report.summary.totalInfra]);
      rows.push(["Attendance Defaulters", report.summary.attDefaulters]);
      rows.push(["Credits Defaulters", report.summary.creditsDefaulters]);
      rows.push([]);

      if (filterModule === "all" || filterModule === "students") {
        rows.push(["--- STUDENT RECORDS ---"]);
        rows.push(["Name", "Attendance %", "Credits", "Results"]);
        report.students.forEach(s => rows.push([s.name, s.attendance, s.credits, s.results || ""]));
        rows.push([]);
      }

      const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Audit_Report_${new Date().toISOString().split("T")[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV Report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download CSV");
    }
  };

  const downloadPDF = () => {
    if (!report) {
      toast.error("No report data available");
      return;
    }
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text("Academic Audit Report", 14, 22);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${timestamp}`, 14, 30);
      doc.line(14, 32, 196, 32);

      // Summary
      doc.setFontSize(14);
      doc.text("1. Executive Summary", 14, 42);
      
      const summaryData = [
        ["Total Students", report.summary.totalStudents],
        ["Total Faculty", report.summary.totalFaculty],
        ["Total Courses", report.summary.totalCourses],
        ["Total Infrastructure", report.summary.totalInfra],
        ["Attendance Defaulters", report.summary.attDefaulters],
        ["Credits Defaulters", report.summary.creditsDefaulters]
      ];

      autoTable(doc, {
        startY: 46,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94] }
      });

      // Attendance Defaulters
      if (report.attDefaulters.length > 0) {
        doc.addPage();
        doc.text("2. Attendance Defaulters", 14, 22);
        autoTable(doc, {
          startY: 28,
          head: [['Name', 'Attendance %', 'Credits']],
          body: report.attDefaulters.map(s => [s.name, `${s.attendance}%`, s.credits]),
          theme: 'grid',
          headStyles: { fillColor: [192, 57, 43] }
        });
      }

      doc.save(`Audit_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF Report downloaded successfully!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF: " + err.message);
    }
  };

  const chartData = report ? [
    { name: 'Students', value: report.summary.totalStudents },
    { name: 'Faculty', value: report.summary.totalFaculty },
    { name: 'Courses', value: report.summary.totalCourses },
    { name: 'Infra', value: report.summary.totalInfra },
  ] : [];

  const pieData = report ? [
    { name: 'Compliant', value: report.summary.totalStudents - report.summary.attDefaulters, color: '#2ecc71' },
    { name: 'Defaulters', value: report.summary.attDefaulters, color: '#e74c3c' },
  ] : [];

  if (loading) return (
    <Container className="mt-5 text-center fade-in-up">
      <div className="glass-card p-5">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p style={{ color: "var(--text-muted)" }}>Generating report...</p>
      </div>
    </Container>
  );

  return (
    <Container className="mt-4 fade-in-up">
      {/* Header */}
      <div className="glass-card p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-bolder m-0">Audit <span className="gradient-text">Report</span></h2>
          <p className="m-0 mt-1" style={{ color: "var(--text-muted)", fontSize: '0.9rem' }}>
            Comprehensive academic compliance report
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <Form.Select
            className="glass-input shadow-none"
            style={{ width: '180px' }}
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
            <option value="courses">Courses Only</option>
            <option value="compliance">Compliance Only</option>
          </Form.Select>
          <Button variant="outline-primary" className="d-flex align-items-center gap-2 px-3 py-2 fw-bold" onClick={downloadCSV}>
            <Download size={14} /> CSV
          </Button>
          <Button className="d-flex align-items-center gap-2 px-3 py-2 fw-bold" onClick={downloadPDF}>
            <FileText size={14} /> Download PDF
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {report && (
        <Row className="mb-4 g-4">
          <Col lg={8}>
            <Card className="glass-card h-100 p-4">
              <h5 className="fw-bolder mb-4 d-flex align-items-center gap-2">
                <BarChartIcon size={20} className="text-primary" /> Module Distribution
              </h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3498db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="glass-card h-100 p-4">
              <h5 className="fw-bolder mb-4 d-flex align-items-center gap-2">
                <PieChartIcon size={20} className="text-danger" /> Attendance Compliance
              </h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Summary Cards */}
      {report && (
        <Row className="g-3 mb-4">
          {[
            { icon: <GraduationCap size={22} />, label: "Students", value: report.summary.totalStudents, color: "success" },
            { icon: <Users size={22} />, label: "Faculty", value: report.summary.totalFaculty, color: "primary" },
            { icon: <BookOpen size={22} />, label: "Courses", value: report.summary.totalCourses, color: "warning" },
            { icon: <Building size={22} />, label: "Infrastructure", value: report.summary.totalInfra, color: "info" },
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
      )}

      {/* Compliance Alert */}
      {report && (
        <div className="mb-4">
          {report.attDefaulters.length === 0 ? (
            <Alert variant="success" className="d-flex align-items-center gap-2">
              <FileText size={18} />
              <strong>All Clear!</strong> All students meet the attendance requirement of {report.summary.attThreshold}%.
            </Alert>
          ) : (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              <FileText size={18} />
              <strong>Action Required:</strong> {report.attDefaulters.length} student(s) below {report.summary.attThreshold}% attendance threshold.
            </Alert>
          )}
        </div>
      )}

      {/* Attendance Defaulters */}
      {report && (filterModule === "all" || filterModule === "compliance") && report.attDefaulters.length > 0 && (
        <Card className="glass-card mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bolder mb-3">
              <span className="text-danger">⚠ Attendance Defaulters</span>
              <Badge bg="danger" className="ms-2 rounded-pill">{report.attDefaulters.length}</Badge>
            </h5>
            <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Student Name</th>
                  <th className="border-0">Attendance %</th>
                  <th className="border-0">Credits</th>
                  <th className="border-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.attDefaulters.map((s, i) => (
                  <tr key={s._id} style={{ backgroundColor: 'transparent' }}>
                    <td>{i + 1}</td>
                    <td className="fw-medium">{s.name}</td>
                    <td><Badge bg="danger" className="rounded-pill px-3">{s.attendance}%</Badge></td>
                    <td>{s.credits}</td>
                    <td><Badge bg="danger">Defaulter</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Student Records */}
      {report && (filterModule === "all" || filterModule === "students") && (
        <Card className="glass-card mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bolder mb-3">Student Academic Records</h5>
            <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="border-0">Name</th>
                  <th className="border-0">Attendance</th>
                  <th className="border-0">Credits</th>
                  <th className="border-0">Results</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((s) => (
                  <tr key={s._id} style={{ backgroundColor: 'transparent' }}>
                    <td className="fw-medium">{s.name}</td>
                    <td><Badge bg={s.attendance < report.summary.attThreshold ? "danger" : "success"} className="rounded-pill px-3">{s.attendance}%</Badge></td>
                    <td>{s.credits}</td>
                    <td style={{ color: "var(--text-muted)" }}>{s.results || "—"}</td>
                  </tr>
                ))}
                {report.students.length === 0 && <tr><td colSpan="4" className="text-center py-3" style={{ color: "var(--text-muted)" }}>No student records</td></tr>}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Faculty Records */}
      {report && (filterModule === "all" || filterModule === "faculty") && (
        <Card className="glass-card mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bolder mb-3">Faculty Records</h5>
            <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="border-0">Name</th>
                  <th className="border-0">Qualification</th>
                  <th className="border-0">Publications</th>
                  <th className="border-0">Workload</th>
                </tr>
              </thead>
              <tbody>
                {report.faculty.map((f) => (
                  <tr key={f._id} style={{ backgroundColor: 'transparent' }}>
                    <td className="fw-medium">{f.name}</td>
                    <td><Badge bg="primary" className="rounded-pill px-3">{f.qualification}</Badge></td>
                    <td>{f.publications || 0}</td>
                    <td style={{ color: "var(--text-muted)" }}>{f.teachingWorkload || "—"}</td>
                  </tr>
                ))}
                {report.faculty.length === 0 && <tr><td colSpan="4" className="text-center py-3" style={{ color: "var(--text-muted)" }}>No faculty records</td></tr>}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Course Records */}
      {report && (filterModule === "all" || filterModule === "courses") && (
        <Card className="glass-card mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bolder mb-3">Course Records</h5>
            <Table hover className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="border-0">Course Name</th>
                  <th className="border-0">Syllabus</th>
                  <th className="border-0">CO-PO Mapping</th>
                </tr>
              </thead>
              <tbody>
                {report.courses.map((c) => (
                  <tr key={c._id} style={{ backgroundColor: 'transparent' }}>
                    <td className="fw-medium">{c.courseName}</td>
                    <td style={{ color: "var(--text-muted)" }}>{c.syllabus?.substring(0, 60)}{c.syllabus?.length > 60 ? '...' : ''}</td>
                    <td>{c.coPoMapping ? <Badge bg="info" className="rounded-pill px-2">Mapped</Badge> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  </tr>
                ))}
                {report.courses.length === 0 && <tr><td colSpan="3" className="text-center py-3" style={{ color: "var(--text-muted)" }}>No course records</td></tr>}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}