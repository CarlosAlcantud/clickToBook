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


// Endpoints 
// User

app.get('/users', (req, res) => {
    User.find({})
        .then(users => res.send(users))
        .catch((error) => console.log(error));
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
        .catch((error) => console.log(error));

});

app.get('/users/:userId', (req, res) => {
    User.find({_id: req.params.userId})
        .then(user => res.send(user))
        .catch((error) => console.log(error));
});

app.patch('/users/:userId', (req, res) => {
    User.findOneAndUpdate({ _id: req.params.userId }, { $set: req.body })
        .then(user => res.send(user))
        .catch((error) => console.log(error));
});

app.delete('/users/:userId', (req, res) => {
    User.findByIdAndDelete(req.params.userId)
        .then(() => {
            return User.find({});
        })
        .then(users => res.send(users))
        .catch((error) => console.log(error));
});
// Apointments

app.get('/appointments', (req, res) => {
    Appointment.find({})
        .then(appointments => res.send(appointments))
        .catch((error) => console.log(error));
}
);


// Worker





app.listen(3000, () => console.log('Server is running on port 3000'));

