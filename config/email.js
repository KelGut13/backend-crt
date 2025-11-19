const { Resend } = require('resend');

// Usar Resend en lugar de Gmail (funciona mejor con Railway)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Enviar email de recuperación de contraseña
 */
const sendPasswordResetEmail = async (email, resetCode) => {
  const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            color: #00d4ff;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #fff;
            border: 2px dashed #00d4ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #00d4ff;
            letter-spacing: 5px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="header">🔐 Recuperación de Contraseña</h1>
          
          <p>Hola,</p>
          
          <p>Recibimos una solicitud para restablecer tu contraseña en <strong>CRT Community</strong>.</p>
          
          <p>Tu código de recuperación es:</p>
          
          <div class="code-box">
            <div class="code">${resetCode}</div>
          </div>
          
          <p>Este código es válido por <strong>15 minutos</strong>.</p>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>No compartas este código con nadie</li>
              <li>Solo úsalo en la aplicación oficial de CRT Community</li>
              <li>Si no solicitaste este cambio, ignora este correo</li>
            </ul>
          </div>
          
          <p>Para restablecer tu contraseña:</p>
          <ol>
            <li>Abre la aplicación CRT Community</li>
            <li>Presiona "¿Olvidaste tu contraseña?" en la pantalla de login</li>
            <li>Ingresa este código cuando se te solicite</li>
            <li>Crea tu nueva contraseña</li>
          </ol>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas.</p>
            <p>&copy; 2025 CRT Community. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'CRT Community <onboarding@resend.dev>',
      to: [email],
      subject: 'Recuperación de Contraseña - CRT Community',
      html: emailContent
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }

    console.log('✅ Email enviado:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};
