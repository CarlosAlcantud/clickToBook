const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const bcrypt = require('bcrypt');
const Worker = require('../database/models/worker');
const Appointment = require('../database/models/appointments');
const checkAuth = require('../middleware/check-auth');

router.post("/createWorker", async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        const worker = new User({
            username: req.body.username,
            email: req.body.email,
            telephone: req.body.phone,
            password: hash,
            role: 'worker'
        });
        
        const savedWorker = await worker.save();

        if(savedWorker){
            workerInfo = new Worker({
                user: savedWorker._id,
                schedule: {
                    start: req.body.schedule.start,
                    end: req.body.schedule.end
                },
                days: req.body.days
            });

            await workerInfo.save();
        }
        res.status(201).json({
             message: 'Worker created successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Creating worker failed', 
            error: error 
        });
    }
});



router.get(
    "/Appointments", 
    checkAuth,
    async (req, res) => {
        try{
            const workerAppointments = await Appointment.find({worker: req.userData.userId}).populate('userId');
            console.log("Los appointments del worker en la base de datos son: ", workerAppointments);
            res.status(200).json({
                message: 'Appointments fetched successfully',
                
                workerAppointments: workerAppointments
            });
        }catch(error){
            res.status(500).json({
                message: 'Internal Server Error',
                error: error
            });
        }
    
   
});

module.exports = router;