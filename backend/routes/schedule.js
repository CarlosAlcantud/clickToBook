const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/appointments');
const checkAuth = require('../middleware/check-auth');
const Worker = require('../database/models/worker');
const User = require('../database/models/user');
// Get all the hours available for a day: 

router.get('/:date', checkAuth, async (req, res) => {
    try {
        console.log("Schedule.js - get() : La fecha seleccionada es: "+req.params.date);
        const date = new Date(req.params.date);
        const startday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

        const intervalMinutes = req.query.intervalMinutes || 30;
        
        let workerId = "";

        if (req.userData.role === 'worker') {
            if (req.query.clientWorker) {
                workerId = req.query.clientWorker;
                console.log("Trabajador loggeado, con id: " +workerId);
            }else if (!req.query.clientWorker && req.query.currentRoute === '/worker/add-client/bookAppointment') {
                console.log("Trabajador no ha seleccionado un cliente ");
                return res.send([]);
            }else{
                console.log("Schedule.js - get() : El trabajador loggeado es: ", req.userData);
                workerId = req.userData.userId;
            }
            
            
        }else if (req.userData.role === 'client') {
            
            workerId = req.userData.worker
        }
        
        const hoursavailable = new Set();
        const hoursnotavailable = new Set();
        
        // Obtener horario del trabajador para saber sus horas de trabajo
        const workerData = await Worker.findOne({ user: workerId }).lean();
        
        if (!workerData) {
            return res.status(404).send({ message: 'Trabajador no encontrado' });
        }

        console.log("Schedule.js - get() : El trabajador seleccionado es: ", workerData);
        
        if (workerData.schedule.start === '' || workerData.days.length === 0 || workerData.schedule.end === '' || workerData.schedule.break === '') {
            return res.status(400).send({ message: 'Horario del trabajador no definido' });
        }
        // Verificar si el día seleccionado está en los días de trabajo del trabajador
        const dayOfWeek = date.getDay(); // 0 (Domingo) a 6 (Sábado)
        
        if (!workerData.days.includes(dayOfWeek)) {
            return res.send([]); // El trabajador no trabaja este día
        }
        
        // Generar todas las horas disponibles basadas en el horario del trabajador
        const [startHour, startMinute] = workerData.schedule.start.split(':').map(Number);
        const [endHour, endMinute] = workerData.schedule.end.split(':').map(Number);
        // Obtener la hora de descanso (break)
        const [breakHour, breakMinute] = workerData.schedule.break ? 
            workerData.schedule.break.split(':').map(Number) : [null, null];
        // Generar horas disponibles en intervalos de 60 minutos (ajusta según necesites)
        console.log("Schedule.js - get() : El horario del trabajador es: ", workerData.schedule);
        for (let h = startHour; h < endHour; h++) {
            const hourStr = `${h.toString().padStart(2, '0')}:00`;
            hoursavailable.add(hourStr);
        }

         let currentHour = startHour;
        let currentMinute = startMinute;
        
        const generateTimeSlots = (endTime) => {
            while ((currentHour < endTime) || 
                   (currentHour === endTime && currentMinute < endMinute)) {
                const hourStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                hoursavailable.add(hourStr);
                
                // Avanzar según el intervalo
                currentMinute += intervalMinutes;
                if (currentMinute >= 60) {
                    currentHour += Math.floor(currentMinute / 60);
                    currentMinute = currentMinute % 60;
                }
            }
        };
        
        if (breakHour !== null) {
            // Generar slots hasta la hora de descanso
            generateTimeSlots(breakHour);
            
            // Saltarse una hora de descanso
            currentHour = breakHour + 1;
            currentMinute = breakMinute;
            
            // Generar slots después del descanso hasta el fin
            generateTimeSlots(endHour);
        } else {
            // No hay descanso, generar todos los slots de una vez
            generateTimeSlots(endHour);
        }
        
        // Obtener las citas ya agendadas para este trabajador en el día
        const appointmentsForTheDay = await Appointment.find({
            date: { $gte: startday, $lte: endOfDay },
            worker: workerId
        }).lean();

        appointmentsForTheDay.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const hoursAndMinutes = `${appointmentDate.getUTCHours().toString().padStart(2, '0')}:${appointmentDate.getUTCMinutes().toString().padStart(2, '0')}`;
            hoursnotavailable.add(hoursAndMinutes);
        });

        // Filtrar las horas no disponibles
        const availableHours = [...hoursavailable].filter(hour => !hoursnotavailable.has(hour));

        // Ordenar las horas disponibles
        const sortedHoursAvailable = availableHours.sort((a, b) => {
            const [aHours, aMinutes] = a.split(':').map(Number);
            const [bHours, bMinutes] = b.split(':').map(Number);
            return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
        });

        console.log(sortedHoursAvailable);
        res.send(sortedHoursAvailable);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

  router.post(
    '/worker',
    checkAuth,
    async (req, res) => {
        try {
            // Verify the user is authorized to create worker schedules
            if (req.userData.role !== 'admin' && req.userData.role !== 'worker') {
                return res.status(403).send({ message: 'No tienes permisos para realizar esta acción' });
            }

            // Create a new worker schedule
            const newWorker = new Worker({
                user: req.userData.userId, // Get the user ID from the authenticated user
                schedule: {
                    start: req.body.schedule.start,
                    break: req.body.schedule.break,
                    end: req.body.schedule.end
                },
                days: req.body.days
            });

            // Save the worker schedule
            const savedWorker = await newWorker.save();
            
            res.status(201).send(savedWorker);
        } catch (error) {
            console.error('Error creating worker schedule:', error);
            
            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(400).send({ 
                    message: 'Ya existe un horario para este trabajador' 
                });
            }
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).send({ 
                    message: 'Error de validación', 
                    errors: messages 
                });
            }
            
            res.status(500).send({ message: 'Error interno del servidor' });
        }
    }
);

router.post(
    '/bulk',
    checkAuth,
    async (req, res) => {
        try {
            console.log("Iniciando creación de horarios masivos");
            // Verify the user is an admin
            if (req.userData.role !== 'worker') {
                return res.status(403).send({ message: 'Solo los administradores pueden crear horarios masivos' });
            }

            // This would require the User model to be imported
            
            
            // Find all users with worker role
            const workerUsers = await User.find({ role: 'worker' });
            
            const results = {
                success: [],
                failures: []
            };

            // Create a worker entry for each user with worker role
            for (const user of workerUsers) {
                try {
                    // Check if worker already exists for this user
                    const existingWorker = await Worker.findOne({ user: user._id });
                    
                    if (existingWorker) {
                        console.log(`Ya existe un horario para el trabajador ${user._id}`);
                        results.failures.push({
                            userId: user._id,
                            message: 'Ya existe un horario para este trabajador'
                        });
                        continue;
                    }
                    console.log(`Creando horario para el trabajador ${user._id}`);
                    // Create new worker with default schedule
                    const newWorker = new Worker({
                        user: user._id,
                        schedule: {
                            start: req.body.defaultSchedule?.start || '08:00',
                            break: req.body.defaultSchedule?.break || '14:00',
                            end: req.body.defaultSchedule?.end || '20:00'
                        },
                        days: req.body.defaultDays || [1, 2, 3, 4, 5] // Monday to Friday by default
                    });

                    const savedWorker = await newWorker.save();
                    results.success.push(savedWorker);
                } catch (error) {
                    console.error(`Error creating schedule for user ${user._id}:`, error);
                    results.failures.push({
                        userId: user._id,
                        error: error.message
                    });
                }
            }

            res.status(201).json({
                message: 'Horarios creados correctamente'
            });
        } catch (error) {
            console.error('Error creating bulk worker schedules:', error);
            res.status(500).send({ message: 'Error interno del servidor' });
        }
    }
);

router.put(
    '/update',
    checkAuth,
    async (req, res) => {
        try {
            // Verify the user is authorized
            if (req.userData.role !== 'worker') {
                return res.status(403).send({ message: 'No tienes permisos para realizar esta acción' });
            }

            const updatedWorker = await Worker.findOneAndUpdate(
                { user: req.userData.userId },
                {
                    schedule: {
                        start: req.body.schedule.start,
                        break: req.body.schedule.break,
                        end: req.body.schedule.end
                    },
                    days: req.body.days
                },
                { new: true, runValidators: true }
            );

            if (!updatedWorker) {
                return res.status(404).send({ message: 'Horario no encontrado' });
            }

            res.status(200).send(updatedWorker);
        } catch (error) {
            console.error('Error updating worker schedule:', error);
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).send({ 
                    message: 'Error de validación', 
                    errors: messages 
                });
            }
            
            res.status(500).send({ message: 'Error interno del servidor' });
        }
    }
);


router.get(
    '',
    checkAuth,
    async (req, res) => {
        try {
            // Verify the user is authorized
            if (req.userData.role !== 'worker') {
                return res.status(403).send({ message: 'No tienes permisos para realizar esta acción' });
            }

            const worker = await Worker.findOne({ user: req.userData.userId });

            if (!worker) {
                return res.status(404).send({ message: 'Horario no encontrado' });
            }

            res.status(200).send(worker);
        } catch (error) {
            console.error('Error fetching worker schedule:', error);
            res.status(500).send({ message: 'Error interno del servidor' });
        }
    }
);

router.put(
    '/update/all',
    checkAuth,
    async (req, res) => {
        try {
            // Verify the user is an admin
            if (req.userData.role !== 'worker') {
                return res.status(403).send({ message: 'Solo los administradores pueden actualizar todos los horarios' });
            }

            const result = await Worker.updateMany(
                {}, // Empty filter to match all documents
                {
                    schedule: {
                        start: req.body.schedule.start,
                        break: req.body.schedule.break,
                        end: req.body.schedule.end
                    },
                    days: req.body.days
                },
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).send({ 
                    message: 'No se encontraron horarios para actualizar' 
                });
            }

            res.status(200).send({ 
                message: `Se actualizaron ${result.modifiedCount} horarios correctamente`,
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            });

        } catch (error) {
            console.error('Error updating worker schedules:', error);
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).send({ 
                    message: 'Error de validación', 
                    errors: messages 
                });
            }
            
            res.status(500).send({ message: 'Error interno del servidor' });
        }
    }
);
module.exports = router;