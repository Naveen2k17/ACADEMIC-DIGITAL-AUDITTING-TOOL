const User = require('../models/User');
const AuditRule = require('../models/AuditRule');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Infrastructure = require('../models/Infrastructure');
const CourseAssignment = require('../models/CourseAssignment');
const bcrypt = require('bcryptjs');

const seedDefaultAdmin = async () => {
    try {
        const adminEmail = "admin@audit.com";
        const adminPassword = "admin123";
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "Admin"
            });
            console.log("DEFAULT ADMIN CREATED: admin@audit.com / admin123");
        }
    } catch (error) {
        console.log("Default admin seed error:", error);
    }
};

const seedLargeStructuredData = async () => {
    try {
        console.log("Starting Structured Data Seeding (40+ Students, 20+ Faculty)...");

        // Clear existing data
        await Faculty.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        await Infrastructure.deleteMany({});
        await CourseAssignment.deleteMany({});
        await User.deleteMany({ role: { $ne: 'Admin' } });

        const password = await bcrypt.hash("123", 10);
        const departments = ["Computer Science (CSE)", "Information Technology (IT)", "Electronics (ECE)", "Mechanical (MECH)"];
        const shortDepts = ["CSE", "IT", "ECE", "MECH"];

        // 1. Seed Faculty & HODs
        const facultyData = [];
        const users = [];

        departments.forEach((dept, index) => {
            // HOD for each department
            users.push({
                name: `HOD ${shortDepts[index]}`,
                email: `hod.${shortDepts[index].toLowerCase()}@audit.com`,
                password: password,
                role: "HOD",
                department: dept
            });

            // 5 Faculty per department
            for (let i = 1; i <= 5; i++) {
                const facName = `Dr. ${shortDepts[index]} Prof ${i}`;
                facultyData.push({
                    name: facName,
                    qualification: "Ph.D. Academic Specialist",
                    publications: Math.floor(Math.random() * 20) + 5,
                    teachingWorkload: "12 hours/week",
                    department: dept
                });
                users.push({
                    name: facName,
                    email: `faculty.${shortDepts[index].toLowerCase()}${i}@audit.com`,
                    password: password,
                    role: "Faculty",
                    department: dept
                });
            }
        });

        await Faculty.insertMany(facultyData);
        console.log("20+ Faculty records and HOD accounts created.");

        // 2. Seed 40+ Students
        const studentData = [];
        departments.forEach((dept, dIndex) => {
            // 10 Students per department, distributed across 4 years
            for (let i = 1; i <= 10; i++) {
                const sName = `${shortDepts[dIndex]} Student ${i}`;
                const year = (i % 4) + 1;
                studentData.push({
                    name: sName,
                    attendance: 65 + Math.floor(Math.random() * 35),
                    credits: 80 + Math.floor(Math.random() * 100),
                    results: i % 5 === 0 ? "O" : (i % 5 === 1 ? "A+" : "A"),
                    department: dept,
                    year: year
                });
                users.push({
                    name: sName,
                    email: `student.${shortDepts[dIndex].toLowerCase()}${i}@audit.com`,
                    password: password,
                    role: "Student",
                    department: dept
                });
            }
        });

        await Student.insertMany(studentData);
        await User.insertMany(users);
        console.log("40+ Student records and accounts created.");

        // 3. Seed Courses & Infrastructure (20 each)
        const courses = [];
        const infra = [];
        for (let i = 1; i <= 20; i++) {
            courses.push({
                courseName: `Academic Course ${i}`,
                syllabus: `Detailed syllabus for unit ${i}, module A to F.`,
                coPoMapping: "High alignment with PO1, PO3"
            });
            infra.push({
                labName: `Lab Room ${200 + i}`,
                equipment: "High-spec Workstations, Networking Lab Kits",
                capacity: 30 + (i % 5) * 5,
                location: `Wing ${String.fromCharCode(65 + (i % 4))}`,
                status: "Functional"
            });
        }
        await Course.insertMany(courses);
        await Infrastructure.insertMany(infra);

        console.log("4. Audit Rules and assignments...");
        if (await AuditRule.countDocuments() === 0) {
            await AuditRule.insertMany([
                { ruleName: "Minimum Attendance", type: "attendance", threshold: 75, description: "All students must have min 75% attendance" },
                { ruleName: "Pass Credits", type: "credits", threshold: 120, description: "Graduation requires 120 credits" }
            ]);
        }
        
        // 5. Seed Course Assignments
        const savedFaculty = await User.find({ role: 'Faculty' });
        const savedStudents = await Student.find({});
        const savedCourses = await Course.find({});
        
        for (let i = 0; i < savedFaculty.length; i++) {
            const fac = savedFaculty[i];
            const course = savedCourses[i % savedCourses.length];
            
            // Assign 5 random students
            const shuffledStudents = savedStudents.sort(() => 0.5 - Math.random()).slice(0, 5);
            const assignedStudents = shuffledStudents.map(s => ({
                studentId: s._id,
                studentName: s.name,
                attendance: 0,
                grade: ''
            }));

            await CourseAssignment.create({
                facultyId: fac._id,
                facultyName: fac.name,
                courseName: course.courseName,
                semester: 'Fall 2026',
                section: `A${i+1}`,
                students: assignedStudents
            });
        }

        console.log("Structured Large Data Seeding Completed!");
    } catch (error) {
        console.log("Structured seeding error:", error);
    }
};

module.exports = { seedDefaultAdmin, seedLargeStructuredData };
