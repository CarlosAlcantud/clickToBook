const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/appointments');
const checkAuth = require('../middleware/check-auth');
const axios = require('axios');

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
        console.log('Inicio metodo createAppointment, '+ req.userData.userId +' vamos ha crear la cita. El numero de clases es: '+req.body.classes);
    if(req.userData.role === 'client' && req.body.classes > 0) {
        const date = new Date();
        // if (req.body.date < date) {
        //     return res.status(400).json({
        //         message: 'The date is invalid'
        //     });
        // }
        const appointment = new Appointment({
            'userId': req.userData.userId,
            'date': req.body.appointment.date,
            'haircut': req.body.appointment.haircut,
            'confirmed': req.body.appointment.confirmed,
            'paid': req.body.appointment.paid,
            'worker': req.userData.worker,
        });
        
        // if(req.body.workerId !== undefined){
        //     appointment.worker =  req.body.workerId
        // }

        console.log(appointment);
        appointment.save();
        axios.patch('http://localhost:3000/api/user/addClasses', {
            userId: req.userData.userId,
            classes: -1 // Decrease by 1 class
        });
        res.status(201).json({
            message: 'Clase reservada con éxito',
            classes: req.userData.classes - 1,
        })
    }else if (req.userData.role === 'worker') {
        console.log('El usuario es un worker y tiene permisos para crear la cita vamos a crearla');
        //console.log('El clientId para registrar la cita es: '+req.body.data.user.clientId);
        if (req.body.user.clientId !== ''){
            console.log('El clientId es: '+req.body.user.clientId);
            const appointment = new Appointment({
                'userId': req.body.user.clientId,
                'date': req.body.appointment.date,
                'haircut': req.body.appointment.haircut,
                'confirmed': req.body.appointment.confirmed,
                'paid': req.body.appointment.paid,
                'worker': req.body.user.clientWorker,
            });
            appointment.save();
            axios.patch('http://localhost:3000/api/user/addClasses', {
                userId: req.body.user.clientId,
                classes: -1 // Decrease by 1 class
            });
            res.status(201).json({
                message: 'Clase creada correctamente',
            })
        }else{
            return res.status(400).json({
                message: 'The clientId is invalid'
            });
        }

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
                const userId = appointment.userId;

                Appointment.findByIdAndDelete(req.params.appointmentId)
                .then(() => {
                        // Llamamos a addClasses para sumar una clase
                        return axios.patch('http://localhost:3000/api/user/addClasses', {
                            userId: userId,
                            classes: 1 // Incrementar en 1 clase
                        });
                }) 
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
