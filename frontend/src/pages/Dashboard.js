import { Container, Row, Col, Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import API from "../services/api";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ facultyCount: 0, studentCount: 0, courseCount: 0, infraCount: 0 });
  
  useEffect(() => { 
    API.get("/stats").then(res => setStats(res.data)); 
  }, []);

  const statCards = [
    { label: "Faculty", value: stats.facultyCount, color: "#007bff" },
    { label: "Students", value: stats.studentCount, color: "#28a745" },
    { label: "Courses", value: stats.courseCount, color: "#ffc107" },
    { label: "Infrastructure", value: stats.infraCount, color: "#17a2b8" }
  ];

  const chartData = [
    { name: 'Faculty', value: stats.facultyCount },
    { name: 'Students', value: stats.studentCount },
    { name: 'Courses', value: stats.courseCount },
    { name: 'Infra', value: stats.infraCount },
  ];

  const COLORS = ['#007bff', '#28a745', '#ffc107', '#17a2b8'];

  return (
    <Container className="mt-4 fade-in-up">
      <div className="glass-card p-4 mb-5 border-start border-primary border-5">
        <h2 className="fw-bolder m-0">Institutional <span className="gradient-text">Overview</span></h2>
        <p className="m-0 mt-2" style={{ color: "var(--text-muted)" }}>Welcome back to the Academic Audit Dashboard</p>
      </div>

      <Row className="g-4 mb-5">
        {statCards.map((item, i) => (
          <Col md={3} key={i}>
            <Card className="glass-card text-center h-100 border-0 hover-lift" style={{ borderTop: `4px solid ${item.color} !important`, animationDelay: `${i * 0.1}s` }}>
              <Card.Body className="py-4">
                <h1 className="display-4 fw-bold mb-2" style={{ color: item.color }}>
                  {item.value}
                </h1>
                <Card.Text className="fw-bolder text-uppercase small" style={{ letterSpacing: '1px', color: "var(--text-muted)" }}>
                  {item.label}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="glass-card h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bolder mb-4">Resource <span className="gradient-text">Distribution</span></h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '15px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="glass-card h-100">
            <Card.Body className="p-4 text-center">
              <h5 className="fw-bolder mb-4">Audit <span className="gradient-text">Composition</span></h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}