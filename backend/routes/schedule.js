const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/appointments');
const checkAuth = require('../middleware/check-auth');
const Schedule = require('../database/models/schedule');
// Get all the hours available for a day: 

router.get(
    
    '/:date', async (req, res) => {
    console.log(req.params.date);
    const date = new Date(req.params.date);
    const startday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    const hoursavailable = new Set();
    const hoursnotavailable = new Set();
    const schedule = await Schedule.find().lean();
    const appointmentsForTheDay = await Appointment.find({
        date: { $gte: startday, $lte: endOfDay }
    }).lean();

    appointmentsForTheDay.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        const hoursAndMinutes = `${appointmentDate.getUTCHours().toString().padStart(2, '0')}:${appointmentDate.getUTCMinutes().toString().padStart(2, '0')}`; // Extrae HH:MM en UTC
        hoursnotavailable.add(hoursAndMinutes);
    });

    schedule.forEach(hour => {
        if (!hoursnotavailable.has(hour.hour)) {
            hoursavailable.add(hour.hour);
        }
    });

    const sortedHoursAvailable = [...hoursavailable].sort((a, b) => {
        const [aHours, aMinutes] = a.split(':').map(Number);
        const [bHours, bMinutes] = b.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    console.log(sortedHoursAvailable);

    res.send(sortedHoursAvailable);
});

router.post(
    '',
    //checkAuth,
    async (req, res) => {
    (new Schedule({ 'hour': req.body.hour }))
    .save()
    .then((schedule) => res.send(schedule))
    .catch((error) => {
        console.log(error)
        res.status(500).send({ error: 'Internal Server Error' });
    }
    );
  });

module.exports = router;