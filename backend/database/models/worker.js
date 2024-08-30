const mongoose = require('mongoose');

// Definir el esquema del trabajador
const WorkerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    telephone: {
        type: String,
        trim: true,
        unique: true
    },
    schedule: {
        start: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de hora de inicio es inválido. Debe ser HH:mm']
        },
        end: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de hora de fin es inválido. Debe ser HH:mm']
        }
    },
    days: {
        type: [String],
        enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'], // Días permitidos
        required: true
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
});

const Worker = mongoose.model('Worker', WorkerSchema);

module.exports = Worker;