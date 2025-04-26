const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/appointments');
const checkAuth = require('../middleware/check-auth');

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

router.get(
    '/forUser',
    checkAuth, 
    (req, res) => {
    if(req.userData.role === 'client') {
        Appointment.find({ userId: req.userData.userId })
            .then(appointments => {
                console.log(appointments);
                res.status(200).json({ message: 'Appointments fetched successfully', appointments });
            });
    }else{
        res.status(401).json({
            message: 'The role is not valid'
        });
    }
});

router.post(
    '/createAppointment',
    checkAuth,
    (req, res) => {
    if(req.userData.role === 'client') {
        const date = new Date();
        if (req.body.date < date) {
            return res.status(400).json({
                message: 'The date is invalid'
            });
        }
        const appointment = new Appointment({
            'userId': req.userData.userId,
            'date': req.body.date,
            'haircut': req.body.haircut,
            'confirmed': req.body.confirmed,
            'paid': req.body.paid,
            'worker': '67d5ff7b7b98784e9c0cfb4e'
        });
        
        // if(req.body.workerId !== undefined){
        //     appointment.worker =  req.body.workerId
        // }

        console.log(appointment);
        appointment.save();
        res.status(201).json({
            message: 'Appointment created successfully',
        })
    }else{
        res.status(401).json({
            message: 'The role is not valid'
        });
    }
    
    

});

router.get(
    '',
    (req, res) => {
    Appointment.find({})
        .then(appointments => res.send(appointments))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
}
);

router.patch('/users/:userId/updateAppointment/:appointmentId', 
    checkAuth, 
    verifyUserId, (req, res) => {
    Appointment.findOneAndUpdate({ _id: req.params.appointmentId }, { $set: req.body })
        .then(appointment => res.send(appointment))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});


router.delete('/deleteAppointment/:appointmentId',
    checkAuth, 
    (req, res) => {
    if(req.userData.role !== 'worker') {
        return res.status(401).json({
            message: 'The role is not valid'
        });
    }
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

module.exports = router;
