const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/academic_audit")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@audit.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      // Hash the default password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create the Admin user
      await User.create({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin"
      });

      console.log("******************************************");
      console.log("✅ DEFAULT ADMIN CREATED SUCCESSFULLY");
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log("******************************************");
    } else {
      console.log("ℹ️ Default Admin already exists in Database.");
    }
  } catch (error) {
    console.error("❌ Error seeding default admin:", error);
  }
};

// --- 2. Update Connection Logic to trigger Seed ---
mongoose.connect("mongodb://127.0.0.1:27017/academic_audit")
  .then(() => {
    console.log("MongoDB Connected");
    // CALL THE SEED FUNCTION HERE
    seedDefaultAdmin();
  })
  .catch(err => console.log("MongoDB Connection Error:", err));

// --- Schemas ---
const User = mongoose.model("User", new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String, role: String
}));

const Faculty = mongoose.model("Faculty", new mongoose.Schema({
  name: String, qualification: String, publications: Number
}));

const Student = mongoose.model("Student", new mongoose.Schema({
  name: String, attendance: { type: Number, default: 0 }, credits: Number
}));

const Course = mongoose.model("Course", new mongoose.Schema({
  courseName: String, syllabus: String
}));

const Infrastructure = mongoose.model("Infrastructure", new mongoose.Schema({
  labName: String, equipment: String
}));

const Complaint = mongoose.model("Complaint", new mongoose.Schema({
  title: String, status: { type: String, default: "Pending" }, raisedBy: String
}));

// --- Middleware ---
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).send("No token provided");
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.user = decoded;
    next();
  });
};

// --- Seed Default Admin ---
app.get("/seed-admin", async (req, res) => {
  const adminExists = await User.findOne({ email: "admin@audit.com" });
  if (adminExists) return res.send("Admin already exists");
  
  const hash = await bcrypt.hash("admin123", 10);
  await User.create({ name: "System Admin", email: "admin@audit.com", password: hash, role: "Admin" });
  res.send("Admin Created: admin@audit.com / admin123");
});

// --- Auth ---
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, "secretkey");
    res.json({ token, role: user.role, name: user.name });
  } else res.status(401).json({ message: "Invalid Credentials" });
});

// --- Routes (Admin) ---
app.post("/admin/create-user", verifyToken, async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  await User.create({ ...req.body, password: hash });
  res.json("User Created");
});
app.get("/admin/users", verifyToken, async (req, res) => res.json(await User.find()));

// --- Generic CRUD ---
app.get("/faculty", verifyToken, async (req, res) => res.json(await Faculty.find()));
app.post("/faculty", verifyToken, async (req, res) => { await Faculty.create(req.body); res.json("Saved"); });

app.get("/students", verifyToken, async (req, res) => res.json(await Student.find()));
app.post("/students", verifyToken, async (req, res) => { await Student.create(req.body); res.json("Saved"); });

app.get("/courses", verifyToken, async (req, res) => res.json(await Course.find()));
app.post("/courses", verifyToken, async (req, res) => { await Course.create(req.body); res.json("Saved"); });

app.get("/infra", verifyToken, async (req, res) => res.json(await Infrastructure.find()));
app.post("/infra", verifyToken, async (req, res) => { await Infrastructure.create(req.body); res.json("Saved"); });

// --- Business Logic ---
app.post("/faculty/mark-attendance", verifyToken, async (req, res) => {
  await Student.findByIdAndUpdate(req.body.studentId, { attendance: req.body.attendance });
  res.json("Updated");
});

app.get("/compliance", verifyToken, async (req, res) => {
  res.json(await Student.find({ attendance: { $lt: 75 } }));
});

app.get("/stats", verifyToken, async (req, res) => {
  res.json({
    facultyCount: await Faculty.countDocuments(),
    studentCount: await Student.countDocuments(),
    courseCount: await Course.countDocuments(),
    infraCount: await Infrastructure.countDocuments()
  });
});

// --- Complaints ---
app.get("/complaints", verifyToken, async (req, res) => res.json(await Complaint.find()));
app.post("/complaints", verifyToken, async (req, res) => {
  await Complaint.create({ ...req.body, raisedBy: req.user.id });
  res.json("Logged");
});
app.put("/complaints/:id", verifyToken, async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json("Updated");
});

app.listen(5000, () => console.log("Server running on port 5000"));