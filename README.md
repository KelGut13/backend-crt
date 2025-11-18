# Backend Node.js/Express - CRT Community

API REST para la aplicación CRT Community, usando Node.js, Express y MySQL.

## 📋 Requisitos

- Node.js 14+
- npm o yarn
- MySQL (Hostinger)

## 🚀 Instalación

1. Navega a la carpeta del backend:
```bash
cd backend-node
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno en `.env`:
```
DB_HOST=localhost
DB_USER=u779607948_kelvim
DB_PASSWORD=Cortana1903
DB_NAME=u779607948_gamingApp
DB_PORT=3306

JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

4. Inicia el servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## 🔌 Endpoints Disponibles

### Autenticación

#### POST /api/auth/register
Registrar nuevo usuario
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "contraseña123",
  "nombres": "Juan",
  "primerApellido": "Pérez",
  "segundoApellido": "López"
}
```

#### POST /api/auth/login
Iniciar sesión
```json
{
  "username": "usuario123",
  "password": "contraseña123"
}
```

#### GET /api/auth/me
Obtener datos del usuario actual (requiere token)
```
Headers: Authorization: Bearer <token>
```

## 📁 Estructura

```
backend-node/
├── config/
│   └── database.js       # Configuración MySQL
├── middleware/
│   └── auth.js          # Middleware JWT
├── routes/
│   └── auth.js          # Rutas de autenticación
├── .env                 # Variables de entorno
├── .gitignore
├── package.json
└── server.js            # Punto de entrada
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Variables de entorno para credenciales
- CORS habilitado

## 🌐 Despliegue en Hostinger

Para producción, actualiza las siguientes variables:
- `DB_HOST`: IP o hostname de tu servidor MySQL
- `JWT_SECRET`: Clave secreta fuerte
- `NODE_ENV`: production
