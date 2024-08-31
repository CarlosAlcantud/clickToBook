const express = require('express');

const app = express();
const mongoose = require('./database/mongoose');
app.use(express.json()); // this allows to use json data in the request body
/*  

CORS - Cross Origin Request Security

localhost:3000 - backend API
localhost:4200 - front-end

*/

const User = require('./database/models/user');
const Worker = require('./database/models/worker'); 
const Appointment = require('./database/models/appointments');


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

app.post('/users/:userId/createAppointment', verifyUserId,(req, res) => {
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





app.listen(3000, () => console.log('ClickToBook ready to go!'));

