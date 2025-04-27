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

router.patch('/updateAppointment',
    checkAuth, 
    (req, res) => {
    // Primero, encontrar la cita para validar permisos
    console.log('Inicio metodo updateAppointment, vamos ha actualizar el appointment con id: '+req.body.appointmentId);
    autoriced = false; 
    
    const date = new Date();
    console.log('Hoy es '+ date);
    console.log('La fecha de la cita es: '+req.body.rawDate);
    if (req.body.rawDate < date ) {
        return res.status(400).json({
            message: 'La nueva fecha' + req.body.date + ' no puede ser anterior a hoy ' + date
        });
    }

    Appointment.findById(req.body.appointmentId)
        .then(appointment => {
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            if (req.userData.role === 'worker' && appointment.worker.equals(req.userData.userId) ) {
                console.log('El usuario es un worker y tiene permisos para actualizar la cita');
                autoriced = true;
               
            }else if (req.userData.role === 'client' && appointment.userId.equals(req.userData.userId) ) {
                autoriced = true;
            }

            if(autoriced){
                Appointment.findByIdAndUpdate(
                        req.body.appointmentId, 
                        { date: req.body.date }, // Actualiza solo el campo 'date'
                        { new: true } // Devuelve el documento actualizado
                    ).then(appointment => {
                        if (!appointment) {
                            return res.status(404).json({ message: 'Appointment not found' });
                        }
                        res.status(200).json({ 
                            message: 'Appointment updated successfully', 
                            appointment 
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).send({ error: 'Internal Server Error' });
                    });
            }else{
                res.status(401).json({
                    message: 'Unauthorized to update this appointment'
                });
            }


        })
        .catch(error => {
            console.log(error);
            return res.status(500).send({ error: 'Internal Server Error' });
        });
    
    // Crear un objeto con solo los campos que queremos actualizar
    
});

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
        Appointment.findById(req.params.appointmentId)
        .then(appointment => {
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            if (req.userData.role === 'worker' && appointment.worker.equals(req.userData.userId) ) {
                console.log('El usuario es un worker y tiene permisos para actualizar la cita');
                autoriced = true;
               
            }else if (req.userData.role === 'client' && appointment.userId.equals(req.userData.userId) ) {
                autoriced = true;
            }

            if(autoriced){
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
            }else{
                res.status(401).json({
                    message: 'Unauthorized to update this appointment'
                });
            }


        })
        .catch(error => {
            console.log(error);
            return res.status(500).send({ error: 'Internal Server Error' });
        });
    
    // Crear un objeto con solo los campos que queremos actualizar
    
});

    


module.exports = router;
