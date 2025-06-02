const config = {
    development: {
        frontendUrl: 'http://localhost:4200'
    },
    production: {
        frontendUrl: process.env.FRONTEND_URL || 'https://clbk.es'
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];