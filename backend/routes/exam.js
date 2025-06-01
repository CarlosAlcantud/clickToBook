const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Exam = require('../database/models/exam');
const examNotification = require('../examNotifications');
const axios = require('axios');

router.get(
    '',
    checkAuth,
    (req, res) => {
        if(req.userData.role === 'worker'){
            Exam.find( {date: { $gte: new Date() } })
                .then(exams => {
                    res.status(200).json({ message: 'Examenes recuperados.', exams });
                })
                .catch(error => res.status(500).send({ error: 'Internal Server Error' }));
        }else{
            res.status(401).json({
                message: 'El rol no es valido'
            });
        }

});

router.get(
    '/enrolledExam',
    checkAuth,
    async (req, res) => {
        try {
            if(req.userData.role === 'client') {
                const exams = await Exam.find({
                    'enrolledUsers.userId': req.userData.userId,
                    date: { $gte: new Date() }
                });

                // Just return empty array instead of 404 when no exams found
                const examDates = exams.length > 0 ? exams.map(exam => exam.date) : [];
                return res.status(200).json(examDates);

            } else {
                return res.status(401).json({
                    message: 'El rol no es válido'
                });
            }
        } catch (error) {
            console.error('Error getting enrolled exams:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
);


router.get(
    '/possibleExams',
    checkAuth,
    async (req, res) => {
        console.log('Fetching possible exams for user: ' + req.userData.userId);
        if(req.userData.role === 'client') {
            try {
                // Remove the trailing comma and add date filter
                const exams = await Exam.find({ 
                    'posibleUsers.userId': req.userData.userId,
                    date: { $gte: new Date() }
                });

                // Return empty array if no exams found instead of 404
                return res.status(200).json({ 
                    message: 'Exams for user fetched successfully', 
                    exams: exams || [] 
                });

            } catch (error) {
                console.error('Error fetching possible exams:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            return res.status(401).json({
                message: 'The role is not valid'
            });
        }
    }
);

router.post(
    '/createExam',
    checkAuth,
    async (req, res) => {
        console.log('Creating exam');
        if(req.userData.role === 'worker') {
            console.log('Creating exam for worker: ' + req.userData.userId + ' with date: ' + req.body.examDate + ' and limit: ' + req.body.limit);
            Exists = await Exam.findOne({ date: req.body.examDate });
            if (Exists) {
                return res.status(400).json({ message: 'Ya existe un examen para esa fecha.' });
            }
            const exam = new Exam({
                date: req.body.examDate,
                limit: req.body.limit,
                enrolledUsers: [],
                posibleUsers: []
            });
            
            exam.save()
                .then(result => {
                    examNotification.checkExams();
                    res.status(201).json({ message: 'Se ha notificado la fecha correctamente', exam: result });
                })
                .catch(error => res.status(500).send({ error: 'Internal Server Error' }));
        } else {
            res.status(401).json({
                message: 'The role is not valid'
            });
        }
    }
)

router.post(
    '/enroll/:token',
    async (req, res) => {
        try {
            console.log('enrollBackend() ');
            const token = req.params.token;
            const data = await examNotification.verifyConfirmationToken(token);
            
            if (!data) {
                return res.status(400).json({ message: 'El token ha expirado. Inicia sesión para apuntarte.' });
            }

            const exam = await Exam.findById(data.examId);

            if (!exam) {
                return res.status(404).json({ message: 'El examen no se ha encontrado. Por favor contacte con su profesor.' });
            }
            
            // Usar findOneAndUpdate para hacer la operación atómica
            const updatedExam = await Exam.findOneAndUpdate(
                { 
                    _id: data.examId,
                    'enrolledUsers.userId': { $ne: data.user.userId } // Solo si el usuario NO está inscrito
                },
                {
                    $addToSet: { enrolledUsers: data.user }, // Usa addToSet para evitar duplicados
                    $pull: { posibleUsers: {userId: data.user.userId} } 
                },
                { new: true }
            );
            if (updatedExam) {
                console.log("Se van a actualizar las clases del usuario");
                try {
                await axios.patch('http://localhost:3000/user/addClasses', {
                    userId: data.user.userId,
                    classes: -1
                    });
                } catch (error) {
                    console.error('Error al actualizar las clases del usuario:', error);
                    // Considerar si revertir la inscripción en caso de error
                }

            }
            
            return res.status(200).json({ 
                message: `Te has apuntado exitosamente al examen del día ${getFormatedDate(exam.date)}. ¡Mucha suerte!` 
            });
            
        } catch (error) {
            console.error('Error en la inscripción:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
);


router.post(
    '/enroll',
    checkAuth, // Añadido checkAuth que faltaba
    async (req, res) => {
        try {
            console.log('enroll() called');
            console.log('Exam ID:', req.body.examId);
            const examId = req.body.examId;
            const userId = req.userData.userId;
            console.log('enroll() examId:', examId, 'userId:', userId);
            // Primero encontramos el examen y el usuario posible
            const exam = await Exam.findOne({
                _id: examId
            });
            
            if (!exam) {
                return res.status(404).json({ 
                    message: 'El examen no se ha encontrado o no estás autorizado para inscribirte.' 
                });
            }

            // Encontramos el usuario en posibleUsers
            
            const userToEnroll = exam.posibleUsers.find(user => user.userId.toString() === userId.toString());
            console.log('User to enroll:', userToEnroll);
            if (!userToEnroll) {
                return res.status(400).json({ 
                    message: 'No estás en la lista de usuarios posibles para este examen.' 
                });
            }

            // Actualizamos el examen moviendo el usuario
            const updatedExam = await Exam.findOneAndUpdate(
                { 
                    _id: examId,
                    'enrolledUsers.userId': { $ne: userId } // Solo si el usuario NO está inscrito
                },
                {
                    $addToSet: { enrolledUsers: userToEnroll }, // Añadimos el usuario encontrado
                    $pull: { posibleUsers: { userId: userId } }
                },
                { new: true }
            );
            
            if (!updatedExam) {
                return res.status(400).json({ 
                    message: 'Ya estás inscrito en este examen o ha ocurrido un error.' 
                });
            }
            try {
                await axios.patch('http://localhost:3000/user/addClasses', {
                    userId: userId,
                    classes: -1
                });
            } catch (error) {
                console.error('Error al actualizar las clases del usuario:', error);
                // Considerar si revertir la inscripción en caso de error
            }
            return res.status(200).json({ 
                message: `Te has apuntado exitosamente al examen del día ${getFormatedDate(exam.date)}. ¡Mucha suerte!` 
            });
            
        } catch (error) {
            console.error('Error en la inscripción:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
);

function getFormatedDate(date){

    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return dateFormatter.format(date);
}
module.exports = router;
