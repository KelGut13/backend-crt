# 🚀 Desplegar Backend en Railway.app

## Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con tu cuenta de GitHub

## Paso 2: Conectar el repositorio

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona el repositorio: `KelGut13/backend-crt`
4. Railway detectará automáticamente que es un proyecto Node.js

## Paso 3: Configurar Variables de Entorno

En Railway, ve a la pestaña **"Variables"** y agrega:

```
DB_HOST=srv1960.hstgr.io
DB_USER=u779607948_admin
DB_PASSWORD=tu_password_de_hostinger
DB_NAME=u779607948_gamingApp
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
```

⚠️ **IMPORTANTE:** Usa tus credenciales reales de Hostinger

## Paso 4: Desplegar

1. Railway desplegará automáticamente el backend
2. Espera unos minutos mientras instala dependencias
3. Una vez terminado, verás el estado en **verde** ✅

## Paso 5: Obtener la URL

1. En Railway, haz clic en tu proyecto
2. Ve a **"Settings"**
3. En la sección **"Networking"**, haz clic en **"Generate Domain"**
4. Copia la URL generada (algo como: `https://backend-crt-production.up.railway.app`)

## Paso 6: Actualizar la App

En tu proyecto de React Native, actualiza el archivo `lib/api.ts`:

```typescript
export const API_CONFIG = {
  baseURL: 'https://tu-app.railway.app/api', // 👈 Cambia esta URL
  // ... resto del código
}
```

## 🎯 Listo!

Tu backend ahora está en línea y accesible desde cualquier lugar. Cuando generes el APK, la app funcionará sin necesitar tu computadora encendida.

## 📝 Comandos útiles de Railway

- **Ver logs:** En Railway > Deployments > Click en el deployment > Ver logs
- **Re-desplegar:** Push a GitHub y Railway despliega automáticamente
- **Variables:** Railway > Settings > Variables

## 🔄 Actualizaciones futuras

Cada vez que hagas cambios en el backend:

```bash
cd backend-node
git add .
git commit -m "Descripción de cambios"
git push
```

Railway desplegará automáticamente los cambios.
