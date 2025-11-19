# Configuración de Email para Recuperación de Contraseña

## 📧 Cómo Configurar Gmail para Enviar Emails

### Paso 1: Crear una Contraseña de Aplicación en Gmail

1. **Accede a tu cuenta de Gmail** que quieras usar para enviar emails

2. **Ve a la configuración de seguridad de Google:**
   - Visita: https://myaccount.google.com/security
   
3. **Habilita la verificación en 2 pasos** (si no está activa):
   - Busca "Verificación en 2 pasos"
   - Sigue las instrucciones para activarla

4. **Crea una contraseña de aplicación:**
   - Visita: https://myaccount.google.com/apppasswords
   - En "Selecciona la app" → Elige "Correo"
   - En "Selecciona el dispositivo" → Elige "Otro (nombre personalizado)"
   - Escribe: "CRT Community Backend"
   - Haz clic en "Generar"
   - **Copia la contraseña de 16 caracteres** que aparece (sin espacios)

### Paso 2: Configurar Variables de Entorno en Railway

1. **Accede a tu proyecto en Railway:**
   - Ve a https://railway.app
   - Abre tu proyecto "backend-crt"

2. **Agrega las variables de entorno:**
   - Haz clic en tu servicio
   - Ve a la pestaña "Variables"
   - Agrega estas dos nuevas variables:

   ```
   EMAIL_USER = tu_email@gmail.com
   EMAIL_PASSWORD = la_contraseña_de_16_caracteres
   ```

3. **Guarda los cambios** y Railway redesplegará automáticamente

### Paso 3: Probar el Sistema

1. **Abre la app CRT Community**
2. **Ve a la pantalla de login**
3. **Ingresa un email registrado**
4. **Presiona "¿Olvidaste tu contraseña?"**
5. **Revisa tu email** - deberías recibir un código de 6 dígitos
6. **Ingresa el código** en la app cuando se te solicite
7. **Crea tu nueva contraseña**

## 🎨 Diseño del Email

El email incluye:
- ✅ Diseño profesional con HTML/CSS
- ✅ Código de recuperación destacado
- ✅ Instrucciones claras de uso
- ✅ Advertencias de seguridad
- ✅ Límite de tiempo (15 minutos)
- ✅ Branding de CRT Community

## ⚡ Funcionamiento del Sistema

### Flujo Completo:

1. **Usuario solicita recuperación:**
   - Ingresa email en la app
   - Presiona "¿Olvidaste tu contraseña?"

2. **Backend genera código:**
   - Crea código de 6 dígitos aleatorio
   - Guarda en base de datos con expiración de 15 min
   - Envía email con código

3. **Usuario recibe email:**
   - Email llega con diseño profesional
   - Muestra código de 6 dígitos
   - Incluye instrucciones

4. **Usuario restablece contraseña:**
   - Ingresa código en la app
   - Crea nueva contraseña
   - Código se marca como usado

### Seguridad:

- ✅ Contraseñas de aplicación de Google (no contraseña real)
- ✅ Códigos expiran en 15 minutos
- ✅ Códigos de un solo uso
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de longitud de contraseña (mínimo 6 caracteres)

## 🔄 Fallback

Si el envío de email falla por alguna razón, el sistema tiene un fallback que muestra el código directamente en la app, asegurando que el usuario siempre pueda recuperar su contraseña.

## 🚨 Solución de Problemas

### Error: "Invalid login"
- Verifica que hayas habilitado la verificación en 2 pasos
- Asegúrate de usar una contraseña de aplicación, no tu contraseña de Gmail
- Verifica que la contraseña no tenga espacios

### Email no llega
- Revisa la carpeta de spam
- Verifica que el email esté correctamente escrito en `EMAIL_USER`
- Checa los logs de Railway para ver errores

### Límite de envío
- Gmail tiene un límite de ~500 emails por día para cuentas gratuitas
- Para más volumen, considera usar SendGrid, AWS SES o Mailgun

## 📊 Variables de Entorno Completas

Tu archivo `.env` en Railway debe tener:

```bash
# Database
DB_HOST=srv1960.hstgr.io
DB_USER=u779607948_Gaming_App_Admin
DB_PASSWORD=tu_password_db
DB_NAME=u779607948_gamingApp

# JWT
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# Email (NUEVO)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_16_chars
```

## 🎯 Próximos Pasos

Una vez configurado, puedes:
- ✅ Personalizar el diseño del email en `/config/email.js`
- ✅ Cambiar el tiempo de expiración (actualmente 15 min)
- ✅ Agregar límite de intentos por IP
- ✅ Implementar notificaciones de cambio de contraseña exitoso
