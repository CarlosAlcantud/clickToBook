const mongoose = require('mongoose');
// const Schedule = require('./schedule');
const AppointmentSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        worker: {   
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worker',
            required: false
        },    
        date: {
            type: Date,
            required: true,
            unique: true,
            trim: true,
            // validate: {
            //     validator: async function (value) {
            //         const hour = value.toISOString().split('T')[1].slice(0,5);
            //         const validHour = await Schedule.findOne({hour : hour})
            //         return !!validHour;

            //     },
            //     message: props => `The hour ${props.value} is not available`
            // }
        },
        haircut: {
            type: String,
            enum: ['Corte de pelo', 'Corte de barba', 'Corte de pelo y barba'],
            required: true,
            
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
