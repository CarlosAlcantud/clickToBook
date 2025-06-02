// const twilio = require('twilio');
// const credentials = require('./credentials');
// const accountSid = credentials.accountSid;
// const authToken = credentials.authToken;

// const client = twilio(accountSid, authToken);
// const phoneNumber = '+18456715502'//credentials.number; // Your Twilio WhatsApp number

// async function sendWhatsApp(to, message) {
//     console.log(`Sending WhatsApp message to ${to}: ${message}`);
//     try {
       
//         await client.messages.create({
//             body: message,
//             from: phoneNumber, // Your Twilio WhatsApp number
//             to: to
//         });
        
        
//         console.log(`WhatsApp message to ${phoneNumber}: ${message}`);
//         // For now, just log the message
//         return true;
//     } catch (error) {
//         console.error('Error sending WhatsApp notification:', error);
//         return false;
//     }
// }


// module.exports = sendWhatsApp;