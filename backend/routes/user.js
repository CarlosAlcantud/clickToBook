const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const askConfirmation = require('../askConfirmation');
const Appointment = require('../database/models/appointments');
// User

router.get('/users', (req, res) => {
    console.log("function get(users).app.js");
    User.find({ role: 'client' })
        .select('_id worker username classes') // Solo selecciona los campos específicos
        .then(users => {
            // Formatear la respuesta para que tenga exactamente el formato que necesitas
            const formattedUsers = users.map(user => {
                console.log("Prueba clases, funciona",user._id, user.worker, user.username, user.classes);
                return {
                    clientId: user._id,
                    clientWorker: user.worker,
                    username: user.username,
                    classes: user.classes
                };
            });
            res.send(formattedUsers);
        })
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        });
});

// 
router.get('/workers', (req, res) => {
    console.log("function get(workers).app.js");
    User.find({ role: 'worker' })
        .then(users => res.send(users))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
}
);


router.post("/auth/singup", (req,res) => {
    console.log("function post(auth/singup/).app.js");
    bcrypt.hash(req.body.password, 10)
    .then((hash) => {
        const user = new User({
            username: req.body.username,
            telephone: req.body.phone,
            password: hash,
            role: 'client',
            worker: req.body.worker,
            classes: 0
        });
        user.save()
        .then(result => {
            res.status(201).json({
                message: 'User created',
                result: result
            });
        })
        .catch(err => {
            console.log("No se pudo crear el usuario");
            res.status(500).json({
                error: err
            });
        });
    })
});



router.get('/users/:userId', (req, res) => {
    User.find({_id: req.params.userId})
        .then(user => res.send(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

router.patch('/users/:userId', (req, res) => {
    User.findOneAndUpdate({ _id: req.params.userId }, { $set: req.body })
        .then(user => res.send(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});

router.delete('/users/:userId', async (req, res) => {
   const deleteAppointments = (user) => {
        Appointment.deleteMany({ userId: user._id})
            .then(() => user)
            .catch((error) => {
                console.log(error)
                res.status(500).send({ error: 'Internal Server Error' });
            });
   };
   const user = User.findByIdAndDelete(req.params.userId)
        .then((user) => deleteAppointments(user))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        });
        res.send(user);

            
});

// login

router.post('/auth/login', (req, res) => {
    let fetchedUser;
    
    // Comprueba si el campo identifier es un email o un teléfono
    let query = {};
    
    // Si contiene un @ es un email, si no es un teléfono
    if (req.body.identifier.includes('@')) {
        query = { email: req.body.identifier };
    } else {
        query = { telephone: req.body.identifier };
    }
    
    User.findOne(query)
    .then(user => {
        if(!user) {
            return res.status(401).json({
                message: 'El usuario no existe'
            });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
        // Si no hay un usuario encontrado, result será undefined y no debemos continuar
        if (!fetchedUser) {
            return;
        }
        
        let token; 
        if (!result) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }
        if (fetchedUser.role === 'client') {
            console.log("El usuario es un cliente,por lo tanto tiene worker asociado");
            token = jwt.sign(
                {userId: fetchedUser._id, role: fetchedUser.role, worker: fetchedUser.worker, classes: fetchedUser.classes, username: fetchedUser.username},
                'secret_this_should_be_longer_like_this_longer_to_be_more_secure_i_thimk_now_it_is_long_enough',
                {expiresIn: '1h'}
            );
        } else {
            token = jwt.sign(
                {userId: fetchedUser._id, role: fetchedUser.role},
                'secret_this_should_be_longer_like_this_longer_to_be_more_secure_i_thimk_now_it_is_long_enough',
                {expiresIn: '1h'}
            );
        }
        
        res.status(200).json({
            token: token,
            expiresIn: 3600,
        });
    })
    .catch(err => {
        console.error(err);
        // Solo enviar respuesta si no se ha enviado ya
        if (!res.headersSent) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
    });
});


router.patch('/user/addClasses', (req, res) => {
    console.log("function post(user/addClasses).app.js");
    const userId = req.body.userId;
    const classes = req.body.classes; 

    User.findByIdAndUpdate(userId, { $inc: { classes: classes } }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(
                {
                    message: 'Classes added successfully',
                    user: updatedUser
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error updating user', error: err });
        });
}
);

router.get('/user/classes', (req, res) => {
    console.log("function get(user/classes).app.js");
    User.findById(req.query.clientId).select('classes')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ classes: user.classes });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error fetching user classes', error: err });
        });

});

router.get('/confirm-appointment/:token', async (req, res) => {
    console.log("confirm-apppointmet - Procedemos a confirmar la cita");
  const token = req.params.token;

  const appointmentId = await askConfirmation.verifyConfirmationToken(token);

  const appointment = await Appointment.findById(appointmentId);
    console.log("Cita a confirmar:", appointmentId);
  if (!appointment) {
    return res.status(404).send('Cita no encontrada');
  }

  if (appointment.confirmed) {
    return res.send('Esta cita ya estaba confirmada ✅');
  }

  appointment.confirmed = true;
  await appointment.save();

  res.send('¡Tu cita ha sido confirmada correctamente! ✅');
});




module.exports = router;