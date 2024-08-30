const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Esto es para gestionar asyncrhonous calls 


mongoose.connect('mongodb://127.0.0.1:27017/clickToBook',) 

    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

module.exports = mongoose;

