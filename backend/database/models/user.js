const mongoose = require('mongoose');
  

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true                  
    },  
    password: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
  
});


const List = mongoose.model('List', ListSchema);

module.exports = List;
