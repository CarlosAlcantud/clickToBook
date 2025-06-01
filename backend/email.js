const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'clickToBook.bookings@gmail.com',
        pass: 'ithn coef zaht gvci'
    }
});

const sendEmail = (email, subject, content, isHtml = false) => {
    const mailOptions = {
        from: 'clickToBook.bookings@gmail.com',
        to: email,
        subject: subject,
        [isHtml ? 'html' : 'text']: content
    };

    return new Promise ((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports = sendEmail;