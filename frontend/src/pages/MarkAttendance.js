import { Container, Table, Button, Form, ProgressBar } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function MarkAttendance() {

  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({});

  useEffect(() => {
    API.get("/students").then(res => setStudents(res.data));
  }, []);

  const saveAttendance = async (id) => {

    const val = values[id];

    if (!val) {
      alert("Enter attendance value");
      return;
    }

    await API.post("/faculty/mark-attendance", {
      studentId: id,
      attendance: val
    });

    alert("Attendance Updated");

    setStudents(prev =>
      prev.map(s =>
        s._id === id ? { ...s, attendance: val } : s
      )
    );
  };

  return (
    <Container>
      <h3 className="mb-4">Mark Student Attendance</h3>

      <Table hover className="bg-white shadow-sm rounded">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Attendance</th>
            <th>Add / Update</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map(s => (
            <tr key={s._id}>

              <td>{s.name}</td>

              <td style={{width:"250px"}}>
                <ProgressBar
                  now={s.attendance}
                  label={`${s.attendance}%`}
                  variant={s.attendance < 75 ? "danger" : "success"}
                  style={{ height: "20px" }}
                />
              </td>

              <td>
                <Form.Control
                  type="number"
                  placeholder="Enter %"
                  onChange={(e) =>
                    setValues({
                      ...values,
                      [s._id]: e.target.value
                    })
                  }
                />
              </td>

              <td>
                <Button
                  size="sm"
                  onClick={() => saveAttendance(s._id)}
                >
                  Update
                </Button>
              </td>

            </tr>
          ))}
        </tbody>

      </Table>

    </Container>
  );
}