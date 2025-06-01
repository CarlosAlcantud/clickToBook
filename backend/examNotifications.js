const Appointment = require('./database/models/appointments');
const User = require('./database/models/user');
const axios = require('axios');
const mongoose = require('mongoose');
const sendEmail = require('./email'); 
const Exam = require('./database/models/exam');
const jwt = require('jsonwebtoken');
const secretKey = "jfqweijro ijqewrlk qjweklrjñ qlkwejr klqjwekñrl jqweklrj lñqjre klñjqrkl jñq w";
const messageForExam = require('./messages'); // Assuming you have a messages.js file for email templates
async function checkExams(){

    try {

        const exams = await Exam.find({
            send: false
        });
        console.log(`Found ${exams.length} exams`);
        if (exams.length !== 0) {
            const posibleUsers = await getPosibleUsers();
            console.log("Posible users: ", posibleUsers);
            if (posibleUsers.length === 0) {
                console.log("No users found with appointments");
                return;
            }
            for (const exam of exams) {
                today = new Date();
                // console.log(`Exam date: ${exam.date}`);
                let usersAdded = false;
                exam.date = new Date(exam.date);
                const daysLeft = getBusinessDays(today,exam.date);
                console.log(`Exam date: ${exam.date}, Days left: ${daysLeft}`);
                for (const posibleUser of posibleUsers) {
                    // console.log("Checking posible user: ", posibleUser);
                    const userExits = exam.posibleUsers.some(user => user.userId.toString() === posibleUser.id);
                    const userEnrolled = exam.enrolledUsers.some(user => user.userId.toString() === posibleUser.id);
                    console.log("User exists in exam: ", userExits);
                    if((posibleUser.futureClasses + posibleUser.classes) <= daysLeft && posibleUser.totalClasses >= 10 && !userExits && !userEnrolled) {
                        console.log("Pushing posible user: ", posibleUser);
                        let expiration = ((posibleUser.futureClasses + posibleUser.classes) - daysLeft); // Calculate expiration based on the difference in days
                        if(expiration <= 0) {
                            expiration = "12h"
                        }else {
                            expiration = expiration + "d"; // Convert to days
                        }
                        
                        console.log("Expiration for user: ", expiration);
                        const posibleUserExam = {
                            userId: posibleUser.id,
                            username: posibleUser.username,
                            email: posibleUser.email

                        }
                        
                        exam.posibleUsers.push(posibleUserExam);
                        token = generateConfirmationToken(posibleUserExam, exam._id, expiration); // Token expires in 1 day
                        // confirmationLink = `http://localhost:3000/exams/enroll/${token}`;
                        confirmationLink = `http://localhost:4200/confirmation/exam/${token}`;
                        // message = `
                        //     <p>Hola ${posibleUser.username},</p>
                        //     <p>Desde el equipo clickToBook queremos informarle que su autoescuela ATZ Driving.</p>
                        //     <p>Le confirma la posibilidad de asistir al examen del dia ${formattedDate} </p>
                        //     <p><a href="${confirmationLink}">Haz click aquí</a> para apuntarte.</p>
                        // `;
                        message = await messageForExam.getExamConfirmationMessage(
                            posibleUser.username,
                            exam.date,
                            confirmationLink);
                        sendEmail(
                            posibleUser.email,
                            'Apuntate al examen',
                            message,
                            true
                        );
                        usersAdded = true;
                    }else {
                        console.log(`User ${posibleUser.username} does not meet the criteria for exam ${exam._id}`);
                    }
                }
                
                if (exam.posibleUsers.length > 0 && usersAdded) {
                    await exam.save(); // Save the exam with updated possible users
                    if (exam.posibleUsers.length === exam.limit) {
                        exam.send = true;
                    }
                    console.log(`Exam updated with possible users`);
                } else {
                    console.log(`No possible users found for exam ${exam._id}`);
                }
            }

        }

    }catch (error) {
        console.error("Error checking exams:", error);
    }

}


getBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

async function getPosibleUsers() {
    const results = await User.aggregate([
            // Filtrar usuarios 
            { $match: { role: 'client' } },
            
            
            { $lookup: {
                from: 'exams',
                let: { userId: '$_id' },
                pipeline: [
                    { 
                        $match: {
                            $expr: {
                                $and: [
                                    { $gte: ['$date', new Date()] }, // Exámenes futuros
                                    { 
                                        $in: [
                                            '$$userId',
                                            { $map: {
                                                input: '$enrolledUsers',
                                                as: 'eu',
                                                in: '$$eu.userId'
                                            }}
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'futureEnrolledExams'
            }},
            
            // Filtrar usuarios que no están en exámenes futuros
            { $match: { 
                'futureEnrolledExams': { $size: 0 } 
            }}, 
            // Hacer lookup con appointments
            { $lookup: {
                from: 'appointments',  // nombre de la colección
                localField: '_id',     // campo en User
                foreignField: 'userId', // campo en Appointment
                as: 'appointments'      // nombre del array resultante
            }},

            // Agregar campos calculados
            { $addFields: {
                pastAppointments: {
                    $size: {
                        $filter: {
                            input: '$appointments',
                            as: 'appointment',
                            cond: { $lt: ['$$appointment.date', new Date()] }
                        }
                    }
                },
                futureAppointments: {
                    $size: {
                        $filter: {
                            input: '$appointments',
                            as: 'appointment', 
                            cond: { $gt: ['$$appointment.date', new Date()] }
                        }
                    }
                }
            }}
        ]);
        return results.map(user => ({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            classes: user.classes,
            pastClasses: user.pastAppointments,
            futureClasses: user.futureAppointments,
            totalClasses: user.pastAppointments + user.futureAppointments + user.classes
        })).sort((a, b) => {
            // Ordenar por total de clases (pasadas + futuras + actuales)
            return b.pastClasses - a.pastClasses;
        });
        
};

function generateConfirmationToken(user, examId, expiration) {
    // Generate a JWT token with the appointment ID as payload
    const token = jwt.sign({ user, examId }, secretKey, { expiresIn: expiration });
    return token;
}

function verifyConfirmationToken(token) {
    // Verify the JWT token and return the appointment ID
    try {
        const decoded = jwt.verify(token, secretKey);
        const data = {
            user: decoded.user,
            examId: decoded.examId
        }
        return data; // Return the userId from the token
    } catch (error) {
        console.error('Invalid or expired token:', error);
        return null;
    }

}

module.exports = {
    checkExams,
    verifyConfirmationToken
};