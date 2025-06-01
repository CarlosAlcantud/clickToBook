const mongoose = require('mongoose');
  

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: true,
        minlength: 1,
        trim: true                  
    },  
    password: {
        type: String,
        required: true,
        minlength: 1,           
        trim: true
    },
    email: {
        type: String,
        required: false,         
        trim: true,
        lowercase: true,
        unique: true,
        // sparse:true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        validate: {
            validator: function(v) {
                return this.telephone || v;
            },
            message: 'Debe proporcionar un email o un teléfono'
        }  
    },
    telephone: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        // sparse:true,
        // Validación personalizada para comprobar que al menos uno de email o telefono está presente
        validate: {
            validator: function (value) {
                return this.email || value; // Devuelve true si el teléfono está presente o si el email está presente
            },
            message: 'Debe proporcionar un teléfono.'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'worker', 'client'],
        required: true,
        
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: false,
    },
    classes: {
        type: Number,
        required: false,
    },

});
// UserSchema.pre('save', function(next) {
//     if (!this.email && !this.telephone) {
//         return next(new Error('Debe proporcionar al menos un email o un teléfono.'));
//     }

// });

const User = mongoose.model('User', UserSchema);

module.exports = User;
