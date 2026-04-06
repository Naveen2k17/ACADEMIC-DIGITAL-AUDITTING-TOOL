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
  await seedDefaultAdmin();
  await seedLargeStructuredData();
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

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

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;