require('dotenv').config();
const connectDB = require('./config/db');
const { seedLargeStructuredData } = require('./utils/seeder');

const debug = async () => {
  try {
    await connectDB();
    await seedLargeStructuredData();
    console.log("SUCCESS");
    process.exit(0);
  } catch (e) {
    console.error("DEBUG ERROR:", e);
    process.exit(1);
  }
};

debug();
