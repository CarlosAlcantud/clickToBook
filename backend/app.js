const express = require('express');
const checkAvailableAppointmentsAndNotify = require('./sendEmails');
const app = express();
const mongoose = require('./database/mongoose');
app.use(express.json()); // this allows to use json data in the request body
const sendEmail = require('./email');
const cron = require('node-cron');
const helmet = require('helmet');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

/*  

CORS - Cross Origin Request Security

localhost:3000 - backend API
localhost:4200 - front-end

*/

const User = require('./database/models/user');
const Worker = require('./database/models/worker'); 
const Appointment = require('./database/models/appointments');
const Schedule = require('./database/models/schedule');

cron.schedule('50 19 * * *', () => {
    console.log('BUSCANDO CITAS...');
    checkAvailableAppointmentsAndNotify.checkAvailableAppointmentsAndNotify(); // Llamar a la función para verificar y notificar
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // * means all domains are allowed
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
}); //this allows to make requests from different domains

const verifyUserId = (req, res, next) => {
    User.findById(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            next();
        })
        .catch(error => res.status(500).send({ error: 'Internal Server Error' }));
};
// Endpoints 
// User

app.get('/users', (req, res) => {
    User.find({})
        .then(users => res.send(users))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

app.post('/createUser', (req, res) => {
    (new User({ 
        'username': req.body.username,
        'password': req.body.password,
        'email': req.body.email,
        'telephone': req.body.telephone
    }))
        .save()
        .then((appointment) => res.send(appointment))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );

});

app.get('/users/:userId', (req, res) => {
    User.find({_id: req.params.userId})
        .then(user => res.send(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

app.patch('/users/:userId', (req, res) => {
    User.findOneAndUpdate({ _id: req.params.userId }, { $set: req.body })
        .then(user => res.send(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

app.delete('/users/:userId', async (req, res) => {
   const deleteAppointments = (user) => {
        Appointment.deleteMany({ userId: user._id})
            .then(() => user)
            .catch((error) => {
                console.log(error)
                res.status(500).send({ error: 'Internal Server Error' });
            });
   };
   const user = User.findByIdAndDelete(req.params.userId)
        .then((user) => deleteAppointments(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        });
        res.send(user);

            
});


// Apointments

app.get('/appointments', (req, res) => {
    Appointment.find({})
        .then(appointments => res.send(appointments))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
}
);

//Prueba 
app.post('/api/createAppointment', (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    res.status(201).json({
        message: 'Appointment created successfully',
    })

});

app.post('/users/:userId/createAppointment', verifyUserId,(req, res) => {
    console.log(req.body);
    console.log("algo pasa");
    (new Appointment({ 'userId': req.params.userId, 'worker': req.body.worker, 'date': req.body.date, 'haircut': req.body.haircut }))
        .save()
        .then((appointment) => res.send(appointment))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

app.get('/users/:userId/appointments', (req, res) => {
    Appointment.find({ userId: req.params.userId })
        .then(appointment => res.send(appointment))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

//Schedule
app.post('/schedule', async (req, res) => {
    (new Schedule({ 'hour': req.body.hour }))
    .save()
    .then((schedule) => res.send(schedule))
    .catch((error) => {
        console.log(error)
        res.status(500).send({ error: 'Internal Server Error' });
    }
    );
  });



app.patch('/users/:userId/updateAppointment/:appointmentId', verifyUserId, (req, res) => {
    Appointment.findOneAndUpdate({ _id: req.params.appointmentId }, { $set: req.body })
        .then(appointment => res.send(appointment))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});


app.delete('/users/:userId/deleteAppointment/:appointmentId', verifyUserId, (req, res) => {
    Appointment.findByIdAndDelete(req.params.appointmentId)
        .then(() => {
            return Appointment.find({});
        })
        .then(appointments => res.send(appointments))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});
// Worker




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


// Get all the hours available for a day: 

app.get('/schedule/:date', async (req, res) => {
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

app.listen(3000, () => console.log('ClickToBook ready to go!'));

