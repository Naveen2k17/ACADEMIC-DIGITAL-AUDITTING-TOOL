require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');
const CourseAssignment = require('./models/CourseAssignment');
const connectDB = require('./config/db');

const seedAssignments = async () => {
    try {
        await connectDB();
        await CourseAssignment.deleteMany({});
        
        const allFaculty = await User.find({ role: 'Faculty' });
        const allStudents = await Student.find({});
        const courses = await Course.find({});

        if (allFaculty.length === 0 || allStudents.length === 0 || courses.length === 0) {
            console.log("Missing base data. Not enough faculty, students, or courses to assign.");
            process.exit(1);
        }

        console.log("Seeding course assignments...");

        for (let i = 0; i < allFaculty.length; i++) {
            const fac = allFaculty[i];
            const course = courses[i % courses.length];
            
            // Assign 5 random students to this faculty's course
            const shuffledStudents = allStudents.sort(() => 0.5 - Math.random()).slice(0, 5);
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
        
        console.log("Course assignments seeded successfully.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedAssignments();
