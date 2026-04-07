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

// Connect Database
connectDB().then(async () => {
    try {
        await seedDefaultAdmin();
        await seedLargeStructuredData();
    } catch (err) {
        console.error("Seeder Error:", err.message);
    }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP to avoid Vercel blocking
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Health check to verify backend is up on Vercel
app.get('/health', (req, res) => res.json({ status: "ok", time: new Date() }));
app.get('/_/backend/health', (req, res) => res.json({ status: "ok", time: new Date() }));

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

// Mount mainRouter for both local development and Vercel production paths
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