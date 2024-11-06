const mongoose = require('mongoose');

const connect = mongoose.connect("mongodb://localhost:27017/userdb");

connect.then(() => {
    console.log('Connected to database successfully');
})
.catch((error) => {
    console.error('Database connection error:', error);
});

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("userdetails", LoginSchema); 
const adminCollection = mongoose.model("admindetails", AdminSchema);

module.exports = {
    collection,
    adminCollection
};
