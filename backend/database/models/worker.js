const mongoose = require('mongoose');

// Definir el esquema del trabajador
const WorkerSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, // Cada Worker debe estar vinculado a un User
        unique: true // Garantiza que un User solo tenga un Worker
    },
    schedule: {
        start: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de hora de inicio es inválido. Debe ser HH:mm']
        },
        break: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de hora de descanso es inválido. Debe ser HH:mm']
        },
        end: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de hora de fin es inválido. Debe ser HH:mm']
        }
    },
    days: {
        type: [Number],
        enum: [1,2,3,4,5], // Días permitidos
        required: true
    }
});

const Worker = mongoose.model('Worker', WorkerSchema);

module.exports = Worker;