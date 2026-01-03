// Script to fix the emailId unique index issue
// Run this once: node fix-index.js

const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

async function fixIndex() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        // Drop all existing indexes on emailId/email
        const indexes = await collection.indexes();
        console.log('Existing indexes:', indexes.map(idx => idx.name));
        
        // Try to drop emailId_1 index
        try {
            await collection.dropIndex('emailId_1');
            console.log('Dropped old emailId_1 index');
        } catch (err) {
            if (err.code === 27) {
                console.log('Index emailId_1 does not exist');
            } else {
                console.log('Error dropping emailId_1:', err.message);
            }
        }
        
        // Try to drop email_1 index (in case it was created with different name)
        try {
            await collection.dropIndex('email_1');
            console.log('Dropped old email_1 index');
        } catch (err) {
            if (err.code === 27) {
                console.log('Index email_1 does not exist');
            } else {
                console.log('Error dropping email_1:', err.message);
            }
        }
        
        // Create a new sparse unique index
        await collection.createIndex({ emailId: 1 }, { unique: true, sparse: true });
        console.log('Created new sparse unique index on emailId');
        
        // Clean up any documents with null/empty emailId (optional)
        const result = await collection.deleteMany({ 
            $or: [
                { emailId: null },
                { emailId: '' },
                { emailId: { $exists: false } }
            ]
        });
        console.log(`Cleaned up ${result.deletedCount} documents with null/empty emailId`);
        
        console.log('Index fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}

fixIndex();

