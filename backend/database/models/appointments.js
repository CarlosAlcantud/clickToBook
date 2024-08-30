const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        worker: {   
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worker',
            required: true
        },    
        date: {
            type: Date,
            required: true,
            trim: true
        },
        haircut: {
            type: String,
            enum: ['Corte de pelo', 'Corte de barba', 'Corte de pelo y barba'],
            required: true,
            
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        confirmed: {
            type: Boolean,
            default: false
        },
        paid: {
            type: Boolean,
            default: false
        },
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
