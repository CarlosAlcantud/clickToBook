const express = require('express');
const checkAvailableAppointmentsAndNotify = require('./sendEmails');
const app = express();
const mongoose = require('./database/mongoose');
const sendEmail = require('./email');
const cron = require('node-cron');
const helmet = require('helmet');
const bodyParser = require('body-parser');

app.use(express.json()); // this allows to use json data in the request body
app.use(bodyParser.json());

const checkAuth = require('./middleware/check-auth');
const askConfirmation = require('./askConfirmation');
/*  

CORS - Cross Origin Request Security

localhost:3000 - backend API
localhost:4200 - front-end

*/

const Appointment = require('./database/models/appointments');
// const Schedule = require('./database/models/schedule');

// cron.schedule('50 19 * * *', () => {
//     console.log('BUSCANDO CITAS...');
//     checkAvailableAppointmentsAndNotify.checkAvailableAppointmentsAndNotify(); // Llamar a la función para verificar y notificar
// });

cron.schedule('15 * * * *', async () => {
  console.log("App.js - Se procede a pedir confirmacion de citas no confirmadas")
  askConfirmation.checkUnconfirmedAppointments();

});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // * means all domains are allowed
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
}); //this allows to make requests from different domains



//Send Email request 

// app.post('/sendEmail', (req, res) => {
//     sendEmail(req.body.email, req.body.subject, req.body.text)
//         .then(() => res.send({ message: 'Email sent' }))
//         .catch((error) => {
//             console.log(error)
//             res.status(500).send({ error: 'Failed to send an email' });
//         }
//         );
// });

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "http://localhost:3000"],
        // Agrega otras directivas según sea necesario
      },
    },
}));

// cron.schedule('*/15 * * * * *', async () => {
//     const startday = new Date(Date.UTC(2024, 9, 29)); // Mes es 0-indexado, así que 9 es octubre
//     const endOfDay = new Date(Date.UTC(2024, 9, 29, 23, 59, 59, 999));
//     const hoursavailable = new Set();
//     const hoursnotavailable = new Set();
//     const schedule = await Schedule.find().lean();
//     const appointmentsForTheDay = await Appointment.find({
//         date: { $gte: startday, $lte: endOfDay }
//     }).lean();

//     appointmentsForTheDay.forEach(appointment => {
//         const appointmentDate = new Date(appointment.date);
//         const hoursAndMinutes = `${appointmentDate.getUTCHours().toString().padStart(2, '0')}:${appointmentDate.getUTCMinutes().toString().padStart(2, '0')}`; // Extrae HH:MM en UTC
//         hoursnotavailable.add(hoursAndMinutes);
//     });

//     schedule.forEach(hour => {
//         if (!hoursnotavailable.has(hour.hour)) {
//             hoursavailable.add(hour.hour);
//         }
//     });

//     const sortedHoursAvailable = [...hoursavailable].sort((a, b) => {
//         const [aHours, aMinutes] = a.split(':').map(Number);
//         const [bHours, bMinutes] = b.split(':').map(Number);
//         return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
//     });

//     console.log(sortedHoursAvailable); // Muestra las horas y minutos no disponibles
// });
//Routes 

const appointmentsRoutes = require('./routes/appointments');
app.use("/appointments", appointmentsRoutes);

const scheduleRoutes = require('./routes/schedule');
app.use("/schedule", scheduleRoutes);

const userRoutes = require('./routes/user');
app.use(userRoutes);

const workerRoutes = require('./routes/worker');
app.use("/worker",workerRoutes);



app.listen(3000, () => console.log('ClickToBook ready to go!'));

