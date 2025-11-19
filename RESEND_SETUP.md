# Configuración de Resend para Envío de Emails

## 📧 Por qué Resend en lugar de Gmail

Railway (y muchas plataformas cloud) bloquean las conexiones SMTP, lo que impide usar Gmail directamente. Resend es una alternativa moderna y gratuita que funciona perfectamente con Railway.

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Crear cuenta en Resend (GRATIS)

1. **Ve a:** https://resend.com/signup
2. **Regístrate** con tu email
3. **Verifica tu email**

### Paso 2: Obtener API Key

1. **En el dashboard de Resend**, ve a "API Keys"
2. **Haz clic en "Create API Key"**
3. **Nombre:** CRT Community Backend
4. **Permission:** Full Access
5. **Copia la API Key** (empieza con `re_`)
   - Ejemplo: `re_123abc456def789ghi`

### Paso 3: Configurar en Railway

1. **Ve a Railway:** https://railway.app
2. **Abre tu proyecto** "backend-crt"
3. **Ve a Variables**
4. **ELIMINA estas variables antiguas:**
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
5. **Agrega esta nueva variable:**
   ```
   RESEND_API_KEY = re_tu_api_key_aqui
   ```
6. **Guarda** - Railway redesplegará automáticamente

### Paso 4: Probar

1. Abre la app CRT Community
2. Ve a login
3. Ingresa un email registrado
4. Presiona "¿Olvidaste tu contraseña?"
5. ¡Revisa tu email! 📧

## ✅ Ventajas de Resend

- ✅ **Funciona con Railway** - No hay problemas de firewall
- ✅ **100% Gratis** - 3,000 emails/mes en plan gratuito
- ✅ **Rápido y confiable** - Entrega garantizada
- ✅ **Sin configuración SMTP** - Solo API Key
- ✅ **Analytics incluído** - Ve estadísticas de tus emails
- ✅ **No requiere verificación de dominio** para desarrollo

## 📊 Límites del Plan Gratuito

- 3,000 emails por mes
- 100 emails por día
- Perfecto para tu app

## 🎨 Email que se Envía

El email incluye:
- Diseño profesional HTML/CSS
- Código de 6 dígitos destacado
- Instrucciones claras
- Advertencias de seguridad
- Tiempo de expiración (15 min)
- Branding CRT Community

## 🔄 Cómo Funciona

1. Usuario solicita recuperación
2. Backend genera código de 6 dígitos
3. **Resend envía email** con el código
4. Usuario recibe email en segundos
5. Usuario ingresa código en la app
6. Contraseña restablecida ✅

## 🚨 Solución de Problemas

### "Invalid API key"
- Verifica que la API Key esté correcta en Railway
- Asegúrate de que empiece con `re_`
- No debe tener espacios

### Email no llega
- Revisa carpeta de spam
- Verifica que el email esté bien escrito
- Checa los logs de Railway
- Verifica el dashboard de Resend (muestra todos los emails)

### "Rate limit exceeded"
- Has enviado más de 100 emails hoy
- Espera hasta mañana
- Considera actualizar a plan de pago ($20/mes)

## 📈 Monitoreo

En el dashboard de Resend puedes ver:
- Emails enviados
- Emails entregados
- Emails abiertos
- Clicks en enlaces
- Errores

## 🎯 Próximos Pasos (Opcional)

### Dominio Personalizado

Para emails profesionales desde tu dominio:

1. Compra un dominio (ejemplo: crtcommunity.com)
2. En Resend: Settings → Domains → Add Domain
3. Agrega los registros DNS que te indican
4. Cambia en `config/email.js`:
   ```javascript
   from: 'CRT Community <noreply@crtcommunity.com>'
   ```

### Templates Personalizados

Resend soporta templates React:
- Diseña emails con componentes React
- Reutiliza templates
- Preview en tiempo real

## 💡 Alternativas

Si Resend no te funciona:
- **SendGrid** - 100 emails/día gratis
- **Mailgun** - 5,000 emails/mes gratis primer mes
- **AWS SES** - Muy barato pero más complejo
- **Postmark** - $10/mes por 10k emails

Pero Resend es la más fácil y rápida de configurar.

## Variables Finales en Railway

```bash
# Database
DB_HOST=srv1960.hstgr.io
DB_USER=u779607948_Gaming_App_Admin  
DB_PASSWORD=tu_password
DB_NAME=u779607948_gamingApp

# JWT
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# Email (Resend)
RESEND_API_KEY=re_tu_api_key
```

¡Eso es todo! Una vez configurado, los emails se enviarán automáticamente. 🎉
