const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Debug: Check if MONGO_URI is loaded
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'NOT LOADED');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running locally on port 27017');
    console.log('2. Or update MONGO_URI in .env to use MongoDB Atlas');
    console.log('3. Check if .env file is in the backend directory');
    process.exit(1);
  }
};

module.exports = connectDB;
