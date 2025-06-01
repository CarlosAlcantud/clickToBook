const Appointment = require('./database/models/appointments');
const User = require('./database/models/user');
const axios = require('axios');
const mongoose = require('mongoose');
const sendEmail = require('./email'); // Importar la función sendEmail
const sendWhatsApp = require('./whatsapp'); // Importar la función sendWhatsApp
const jwt = require('jsonwebtoken');
// Function to check unconfirmed appointments and send WhatsApp notifications
const secretKey = "jfqweijro ijqewrlk qjweklrjñ qlkwejr klqjwekñrl jqweklrj lñqjre klñjqrkl jñq w";
const message = require('./messages'); // Assuming you have a messages.js file for email templates


async function checkUnconfirmedAppointments() {
    console.log("askConfirmation.js - Checking unconfirmed appointments...");
    try {
        const now = new Date(Date.now() + 2 * 60 * 60 * 1000);

        // Sumar 48 horas en milisegundos
        const futureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Sumar 49 horas en milisegundos
        const checkDate = new Date(now.getTime() + 49 * 60 * 60 * 1000);

        console.log(`Checking for unconfirmed appointments between ${futureDate.toISOString()} and ${checkDate.toISOString()}`);

        const unconfirmedAppointments = await Appointment.find({
            date: { $gte: futureDate, $lt: checkDate },
            confirmed: false
        });
        
        console.log(`Found ${unconfirmedAppointments.length} unconfirmed appointments`);
        
        // For each unconfirmed appointment, send WhatsApp notification
        for (const appointment of unconfirmedAppointments) {
            if (!appointment.userId) {
                console.log(`Missing user or phone information for appointment ${appointment._id}`);
                continue;
            }
            
            let user = await User.findById(appointment.userId);
            
            console.log(`User found: ${user.username} (${user.telephone}) and email: ${user.email}`);
            // Update appointment with confirmation token and expiration
            
            token = await generateConfirmationToken(appointment._id);
            confirmationLink =  `http://localhost:4200/confirmation/appointment/${token}`;
            console.log( "La cita para el: " ,appointment.date.toISOString());
            // message = "Hola " + user.username + ", tienes una cita sin confirmar para el dia " + appointment.date.toISOString() + ". ¡Confirma tu cita aqui! " + confirmationLink;
            messageToSend = await message.getAppointmentConfirmationMessage(user.username, appointment.date, confirmationLink);
            sendEmail(
                user.email,
                'Confirma tu cita',
                messageToSend,
                true
            );
        
        }
        
        // Check for expired confirmation tokens and delete those appointments
        // const expiredAppointments = await Appointment.find({
        //     confirmationExpires: { $lt: now },
        //     confirmed: false,
        //     confirmationToken: { $exists: true }
        // }).populate('userId', 'name email phone');
        
        // for (const appointment of expiredAppointments) {
        //     console.log(`Deleting expired appointment for ${appointment.userId.name} scheduled for ${new Date(appointment.date).toLocaleString('es-ES')}`);
            
        //     // Notify user about cancellation
        //     await sendWhatsAppNotification(
        //         appointment.userId.phone,
        //         `Hola ${appointment.userId.name}, tu cita programada para el ${new Date(appointment.date).toLocaleString('es-ES')} 
        //         ha sido cancelada porque no fue confirmada a tiempo. Puedes agendar una nueva cita cuando lo desees.`
        //     );
            
        //     // Refund the class to the user
        //     await axios.patch('http://localhost:3000/user/addClasses', {
        //         userId: appointment.userId._id,
        //         classes: 1 // Return the class that was deducted
        //     });
            
        //     // Delete the appointment
        //     await Appointment.findByIdAndDelete(appointment._id);
        // }
        
    } catch (error) {
        console.error('Error checking unconfirmed appointments:', error);
    }
}


function generateConfirmationToken(appointmentId) {
    // Generate a JWT token with the appointment ID as payload
    const token = jwt.sign({ appointmentId }, secretKey, { expiresIn: '48h' });
    return token;
}

function verifyConfirmationToken(token) {
    // Verify the JWT token and return the appointment ID
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded.appointmentId;
    } catch (error) {
        console.error('Invalid or expired token:', error);
        return null;
    }

}




module.exports = { checkUnconfirmedAppointments, verifyConfirmationToken};