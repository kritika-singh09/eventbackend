require('dotenv').config();
const mongoose = require('mongoose');

async function dropBookingNumberIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('bookings');
    
    // Drop the booking_number index
    await collection.dropIndex('booking_number_1');
    console.log('Successfully dropped booking_number index');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
  }
}

dropBookingNumberIndex();