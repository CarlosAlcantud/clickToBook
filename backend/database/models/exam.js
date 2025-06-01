const mongoose = require('mongoose');
// const Schedule = require('./schedule');
const ExamSchema = new mongoose.Schema({
        date: {
            type: Date,
            required: true,
            unique: true,
            trim: true,
        },
        send: {
            type: Boolean,
            default: false,
        }, 
        enrolledUsers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true

                },
                username: {
                    type: String,
                    required: true,
                    trim: true
                },
                email: {
                    type: String,
                    required: true,
                    trim: true,
                    lowercase: true,
                    match: [/\S+@\S+\.\S+/, 'is invalid']
                },
                
            }
        ], 
        posibleUsers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                username: {
                    type: String,
                    required: true,
                    trim: true
                },
                email: {
                    type: String,
                    required: true,
                    trim: true,
                    lowercase: true,
                    match: [/\S+@\S+\.\S+/, 'is invalid']
                },
            }
        ],  
        limit: {
            type: Number,
            required: true,
            default: 10
        },
});

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam;