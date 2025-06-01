const fs = require('fs');
const path = require('path');

function getLogoAsBase64() {
    const logoPath = path.join(__dirname, '..', 'client', 'src', 'assets', 'logo.png'); // Ajusta la ruta según tu estructura
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

function formatDateToSpanish(date){
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'UTC'
                        });

    const formattedDate = dateFormatter.format(date);
      return formattedDate;                  

}

async function getExamConfirmationMessage(username, date, confirmationLink) {
     const logoBase64 = getLogoAsBase64();
    date = formatDateToSpanish(date);
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                
                <!-- Contenido principal -->
                <div style="padding: 20px; color: #333333;">
                    <h1 style="color: #2c3e50; margin-bottom: 20px;">¡Nuevo examen disponible!</h1>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Hola ${username},</p>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Desde el equipo de ClickToBook y tu autoescuela ATZ Driving, nos complace informarte que tienes la posibilidad de participar en el próximo examen.</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #2c3e50; padding: 15px; margin: 20px 0;">
                        <p style="font-size: 16px; margin: 0;">Fecha del examen: <strong>${date}</strong></p>
                    </div>

                    <!-- Botón de confirmación -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmationLink}" 
                        style="background-color: #2c3e50; 
                                color: #9CD139; 
                                padding: 12px 30px; 
                                text-decoration: none; 
                                border-radius: 5px; 
                                font-weight: bold;
                                display: inline-block;">
                            Confirmar asistencia al examen
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
                    <p style="color: #666666; font-size: 12px;">
                        Este correo es automático, por favor no respondas a esta dirección.<br>
                        © ${new Date().getFullYear()} ClickToBook. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
}

async function getAppointmentConfirmationMessage(username, date, confirmationLink) {
    date = formatDateToSpanish(date);
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                
                <!-- Contenido principal -->
                <div style="padding: 20px; color: #333333;">
                    <h1 style="color: #2c3e50; margin-bottom: 20px;">¡Confirma tu clase!</h1>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Hola ${username},</p>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Le informamos que su clase esta sin confirmar. Confirma tu asistencia por favor. </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #2c3e50; padding: 15px; margin: 20px 0;">
                        <p style="font-size: 16px; margin: 0;">Fecha de la clase es: <strong>${date}</strong></p>
                    </div>

                    <!-- Botón de confirmación -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmationLink}" 
                        style="background-color: #2c3e50; 
                                color: #9CD139; 
                                padding: 12px 30px; 
                                text-decoration: none; 
                                border-radius: 5px; 
                                font-weight: bold;
                                display: inline-block;">
                            Confirmar la clase
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
                    <p style="color: #666666; font-size: 12px;">
                        Este correo es automático, por favor no respondas a esta dirección.<br>
                        © ${new Date().getFullYear()} ClickToBook. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
}
module.exports = {
    getExamConfirmationMessage,
    getAppointmentConfirmationMessage
};
