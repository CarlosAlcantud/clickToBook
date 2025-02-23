const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User

router.get('/users', (req, res) => {
    User.find({})
        .then(users => res.send(users))
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: 'Internal Server Error' });
        }
        );
});


router.post("/auth/singup", (req,res) => {
    console.log("function post(auth/singup/).app.js");
    bcrypt.hash(req.body.password, 10)
    .then((hash) => {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            telephone: req.body.phone,
            password: hash,
            role: 'client'
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
    User.findOne({ email: req.body.email })
    .then(user => {
        
        if(!user) {
            return res.status(401).json({
                message: 'El usuario no existe'
            });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password)
        

    })
    .then(result => {
        
        if (!result) {
            return res.status(401).json({
                message: 'Wrong password'
            });
        }
        const token = jwt.sign(
            {email: fetchedUser.email, userId: fetchedUser._id, role: fetchedUser.role},
            'secret_this_should_be_longer_like_this_longer_to_be_more_secure_i_thimk_now_it_is_long_enough',
            {expiresIn: '1h'}
        );
        res.status(200).json({
            token: token,
            expiresIn: 3600,
        });
    })
    .catch(err => {
        
        return res.status(401).json({
            message: 'Auth failed'
        });
    });
});

module.exports = router;