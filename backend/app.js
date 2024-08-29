const express = require('express');

const app = express();
const mongoose = require('./database/mongoose');

/*  

CORS - Cross Origin Request Security

localhost:3000 - backend API
localhost:4200 - front-end

*/

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // * means all domains are allowed
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
}); //this allows to make requests from different domains





app.use(express.json()); // this allows to use json data in the request body

app.listen(3000, () => console.log('Server is running on port 3000'));

