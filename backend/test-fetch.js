require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const CourseAssignment = require('./models/CourseAssignment');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const docs = await CourseAssignment.find().limit(2);
    const users = await User.find({ role: 'Faculty' }).limit(2);
    fs.writeFileSync('test-fetch.out', JSON.stringify({ docs, users }, null, 2));
    process.exit(0);
});
