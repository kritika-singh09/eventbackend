const mongoose = require('mongoose');
require('dotenv').config();

async function removeUniqueIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Drop unique index on buyer_phone if it exists
    try {
      await db.collection('bookings').dropIndex('buyer_phone_1');
      console.log('Dropped buyer_phone unique index');
    } catch (error) {
      console.log('No buyer_phone index to drop');
    }
    
    // List all indexes
    const indexes = await db.collection('bookings').indexes();
    console.log('Current indexes:', indexes);
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeUniqueIndex();