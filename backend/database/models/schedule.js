const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    hour: {
        type: String,
        required: true,
        unique: true
    }
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;