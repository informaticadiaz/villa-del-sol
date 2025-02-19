import nodemailer from 'nodemailer';

/**
 * Configuración del transporter de nodemailer
 * En producción, deberías usar variables de entorno para estas credenciales
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.email - Dirección de correo del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.text - Contenido del correo en texto plano
 * @param {string} [options.html] - Contenido del correo en HTML (opcional)
 * @returns {Promise} Resultado del envío
 */
export const sendEmail = async ({ email, subject, text, html }) => {
    try {
        // Verificar parámetros requeridos
        if (!email || !subject || !text) {
            throw new Error('Email, subject y text son campos requeridos');
        }

        const mailOptions = {
            from: `"Villa del Sol" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text,
            html: html || text // Si no se proporciona HTML, usa el texto plano
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);

        console.log('Email enviado:', info.messageId);
        return info;

    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar el correo electrónico');
    }
};

// Función para verificar la configuración del email
export const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('Servidor de correo listo para enviar mensajes');
        return true;
    } catch (error) {
        console.error('Error en la configuración del servidor de correo:', error);
        return false;
    }
};

// Plantillas de correo predefinidas
export const emailTemplates = {
    resetPassword: (resetUrl) => ({
        subject: 'Recuperación de Contraseña - Villa del Sol',
        text: `Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para continuar: ${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Recuperación de Contraseña</h2>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para continuar:</p>
                <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                <hr>
                <p style="color: #666;">Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
        `
    }),

    welcomeEmail: (username) => ({
        subject: 'Bienvenido a Villa del Sol',
        text: `¡Bienvenido ${username} a Villa del Sol!\n\nTu cuenta ha sido creada exitosamente. Puedes acceder al sistema utilizando tu correo electrónico y contraseña.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>¡Bienvenido a Villa del Sol!</h2>
                <p>Hola ${username},</p>
                <p>Tu cuenta ha sido creada exitosamente.</p>
                <p>Puedes acceder al sistema utilizando tu correo electrónico y contraseña.</p>
                <hr>
                <p style="color: #666;">Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
        `
    })
};