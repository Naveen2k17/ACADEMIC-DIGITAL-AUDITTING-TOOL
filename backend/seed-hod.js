require('dotenv').config();
const connectDB = require('./config/db');
const CourseAssignment = require('./models/CourseAssignment');
const PublicationApproval = require('./models/PublicationApproval');
const SyllabusApproval = require('./models/SyllabusApproval');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Student = require('./models/Student');

const seedHOD = async () => {
  try {
    await connectDB();
    
    await CourseAssignment.deleteMany({});
    await PublicationApproval.deleteMany({});
    await SyllabusApproval.deleteMany({});

    const faculties = await Faculty.find().limit(4);
    const courses = await Course.find().limit(4);
    const students = await Student.find().limit(10);
    
    const assignments = [];
    const publications = [];
    const syllabi = [];

    if(faculties.length > 0) {
        faculties.forEach((f, i) => {
            const courseTitle = courses[i] ? courses[i].courseName : "Default Course Default";
            
            assignments.push({
                facultyId: f._id,
                facultyName: f.name,
                courseName: courseTitle,
                semester: "Fall 2026",
                section: "A",
                students: students.map(s => ({ studentId: s._id, studentName: s.name }))
            });

            publications.push({
                title: `AI in Modern Auditing ${i+1}`,
                journal: "IEEE Xplore",
                author: f.name,
                year: 2026,
                facultyId: f._id,
                facultyName: f.name,
                status: "Pending",
                remarks: ""
            });
            
            publications.push({
                title: `Scalable Cloud Architecture ${i+1}`,
                journal: "ACM Digital Library",
                author: f.name,
                year: 2025,
                facultyId: f._id,
                facultyName: f.name,
                status: "Approved",
                remarks: "Meets all standards."
            });

            publications.push({
                title: `Quantum Cryptography Analysis ${i+1}`,
                journal: "Springer Tech",
                author: f.name,
                year: 2024,
                facultyId: f._id,
                facultyName: f.name,
                status: "Correction Requested",
                remarks: "Please update citation styling."
            });

            syllabi.push({
                courseName: courseTitle,
                syllabus: "Unit 1: Fundamentals, Unit 2: Advanced Topics, Unit 3: Practical Apps",
                coPoMapping: "Mapped heavily to PO1, PO3, PO5",
                submittedBy: f.name,
                submittedById: f._id,
                status: "Pending"
            });
            
            syllabi.push({
                courseName: courseTitle + " Lab",
                syllabus: "Weekly lab assignments and final project parameters.",
                coPoMapping: "Mapped to PO4, PO6",
                submittedBy: f.name,
                submittedById: f._id,
                status: "Approved"
            });
        });

        await CourseAssignment.insertMany(assignments);
        await PublicationApproval.insertMany(publications);
        await SyllabusApproval.insertMany(syllabi);
        console.log("HOD Sample Data Seeded Successfully!");
    } else {
        console.log("No faculties found to attach to HOD data.");
    }
    
    process.exit(0);
  } catch(err) {
    console.error("Error seeding HOD data:", err);
    process.exit(1);
  }
};

seedHOD();
