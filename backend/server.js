require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { seedDefaultAdmin, seedLargeStructuredData } = require('./utils/seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const infraRoutes = require('./routes/infraRoutes');
const auditRoutes = require('./routes/auditRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();

// Connect Database and Auto-Seed if empty
connectDB().then(async () => {
    try {
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        if (userCount <= 1) { // Only Admin or Empty
             const { seedDefaultAdmin, seedLargeStructuredData } = require('./utils/seeder');
             await seedDefaultAdmin();
             await seedLargeStructuredData();
             console.log("Database Auto-Seeded successfully.");
        }
    } catch (err) {
        console.error("Auto-Seed Warning:", err.message);
    }
}).catch(err => {
    console.error("Fatal: failed to connect to database:", err);
    process.exit(1);
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Main Health/Debug Routes
app.get('/_/backend/health', async (req, res) => {
    try {
        const User = require('./models/User');
        res.json({ 
            status: "ready", 
            db_connected: true,
            user_count: await User.countDocuments()
        });
    } catch (e) { res.json({ status: "error", msg: e.message }); }
});

// Routes
const mainRouter = express.Router();
mainRouter.use('/', authRoutes);
mainRouter.use('/admin', userRoutes);
mainRouter.use('/faculty', facultyRoutes);
mainRouter.use('/students', studentRoutes);
mainRouter.use('/courses', courseRoutes);
mainRouter.use('/infra', infraRoutes);
mainRouter.use('/', auditRoutes);
mainRouter.use('/assignments', assignmentRoutes);
mainRouter.use('/', submissionRoutes); 
mainRouter.use('/complaints', complaintRoutes);

// Vercel path mounting
app.use('/_/backend', mainRouter);
app.use('/', mainRouter);



// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


module.exports = app;