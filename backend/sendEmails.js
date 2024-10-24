const cron = require('node-cron');
const mongoose = require('mongoose');
const Appointment = require('./database/models/appointments'); // Importar tu modelo de reserva
const User = require('./database/models/user'); // Importar tu modelo de usuario
const sendEmail = require('./email'); // Importar la función sendEmail


// Función para verificar citas y enviar correos de recordatorio
async function checkAvailableAppointmentsAndNotify() {
    try {
        
        // Obtener la fecha y hora actual
        // Obtener la fecha y hora actual
        const now = new Date();
        const UsersWithAppointments = new Set();
        // Obtener todos los usuarios de la base de datos
        const allUsers = await User.find().lean(); 

        console.log(`Hoy es dia:  ${now}...`);
        // Calcular el inicio del día siguiente
        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1); // Moverse a mañana
        tomorrowStart.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00.000 en la zona horaria local
        console.log(`Mañana es dia:  ${tomorrowStart}`);
        

        // Calcular el fin del día siguiente
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999); 
        console.log(`Mañana es dia:  ${tomorrowEnd}`);
        // Buscar citas que estén disponibles (no confirmadas) en el día siguiente

        const availableAppointments = await Appointment.find({
            date: { $gte: tomorrowStart, $lte: tomorrowEnd }, // Entre el inicio y fin de mañana
            confirmed: false, // Citas que no están confirmadas
        }).lean(); // Convertir a objetos JavaScript
        

        if (availableAppointments.length > 0) {
            console.log(`Mañana hay ${availableAppointments.length} citas disponibles. `);
            availableAppointments.forEach(appointment => {
                UsersWithAppointments.add(appointment.userId.toString());
                console.log(`Cita disponible: ${appointment.date.toISOString()}`);
            });

            allUsers.forEach(user => {
                if(!UsersWithAppointments.has(user._id.toString())){
                    console.log(`Enviando correo a ${user.email}...`);
                    sendEmail(
                        user.email,
                        'Recordatorio de Disponibilidad de Citas',
                        `Hola ${user.name}, hay una cita disponible el. ¡Reserva tu cita ahora!`
                    );
                }
                        
            });
        }
        else{
            console.log(`Mañana no hay citas disponibles.`);
        }
        
    } catch (error) {
        // Manejar cualquier error que ocurra durante la ejecución de la función
        console.error('Error al verificar citas disponibles y enviar recordatorios:', error);
    }
}

// Programar la tarea para que se ejecute una vez al día a las 9:00 AM

module.exports = { checkAvailableAppointmentsAndNotify };