# Sistema de Recuperación de Contraseña

## Instalación de la Base de Datos

Para habilitar la funcionalidad de recuperación de contraseña, necesitas ejecutar este SQL en tu base de datos MySQL de Hostinger:

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  resetCode VARCHAR(6) NOT NULL,
  expiresAt DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_code (resetCode),
  INDEX idx_expires (expiresAt)
);
```

## Cómo ejecutar el SQL

### Opción 1: PHPMyAdmin (Hostinger)
1. Accede a tu panel de Hostinger
2. Ve a "Bases de datos" → "phpMyAdmin"
3. Selecciona tu base de datos `u779607948_gamingApp`
4. Ve a la pestaña "SQL"
5. Copia y pega el comando SQL de arriba
6. Haz clic en "Continuar"

### Opción 2: Desde el backend
También puedes conectarte desde tu computadora:

```bash
cd backend-node
mysql -h srv1960.hstgr.io -u u779607948_Gaming_App_Admin -p u779607948_gamingApp < setup-password-reset.sql
```

## Cómo funciona

1. **Usuario solicita recuperación:**
   - Usuario ingresa su email en la pantalla de login
   - Presiona "¿Olvidaste tu contraseña?"
   - El sistema genera un código de 6 dígitos

2. **Código generado:**
   - El código se guarda en la tabla `password_resets`
   - Expira en 15 minutos
   - Se muestra directamente al usuario (en producción se enviaría por email)

3. **Usuario restablece contraseña:**
   - Se muestra un prompt para ingresar la nueva contraseña
   - Se valida el código
   - Se actualiza la contraseña
   - El código se marca como usado

## Endpoints del Backend

### POST /api/auth/forgot-password
Genera un código de recuperación.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código de recuperación generado",
  "data": {
    "resetCode": "123456",
    "email": "usuario@ejemplo.com",
    "expiresIn": "15 minutos"
  }
}
```

### POST /api/auth/reset-password
Restablece la contraseña usando el código.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "resetCode": "123456",
  "newPassword": "nuevaContraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

## Notas de Seguridad

- Los códigos expiran en 15 minutos
- Un código solo se puede usar una vez
- Las contraseñas se almacenan con bcrypt hash
- En producción, el código se debería enviar por email en lugar de mostrarlo en pantalla

## Para producción (futuro)

Para enviar emails reales, puedes integrar servicios como:
- SendGrid
- AWS SES
- Mailgun
- Resend

Ejemplo con Nodemailer + Gmail:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  from: 'noreply@tuapp.com',
  to: email,
  subject: 'Recuperación de contraseña',
  html: `
    <h1>Código de recuperación</h1>
    <p>Tu código es: <strong>${resetCode}</strong></p>
    <p>Expira en 15 minutos.</p>
  `
});
```
