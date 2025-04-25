const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        //console.log("token del usuario",token);
        const decodedToken = jwt.verify(token, 'secret_this_should_be_longer_like_this_longer_to_be_more_secure_i_thimk_now_it_is_long_enough');
        if(decodedToken.role === 'worker'){
            req.userData = {email: decodedToken.email, userId: decodedToken.userId, workerId: decodedToken.userId, role: decodedToken.role};
        }else{
            req.userData = {email: decodedToken.email, userId: decodedToken.userId, role: decodedToken.role};

        }
        next();
    }catch(error){
        res.status(401).json({
            message: 'You are not authenticated'
        });
    }
    
    

};