# README - Sistema de Fotos de Perfil

## 📸 Cómo funciona

### Backend (Express)
- **Carpeta de uploads**: `/backend-node/uploads/profiles/`
- **Endpoint**: `PUT /api/users/upload-photo`
- **Archivos servidos**: `http://192.168.1.6:3000/uploads/profiles/foto.jpg`

### Base de Datos
- **Tabla**: `users`
- **Campo**: `photoURL` (tipo: TEXT)
- **Formato guardado**: `/uploads/profiles/nombre-archivo.jpg` (ruta relativa)

### Frontend (React Native)
- **Construcción de URL**: 
  - Base: `http://192.168.1.6:3000`
  - Ruta: `/uploads/profiles/foto.jpg`
  - URL completa: `http://192.168.1.6:3000/uploads/profiles/foto.jpg`

## 🧪 Cómo probar

1. **Abre la app en el simulador**
2. **Ve al perfil del usuario** (toca tu avatar en la página principal)
3. **Toca la foto de perfil grande**
4. **Selecciona una imagen de la galería**
5. **Recorta la imagen (1:1)**
6. **Presiona "Elegir"**

### ¿Qué debe pasar?
- ✅ La imagen se muestra temporalmente
- ✅ Se sube al servidor (verás logs en la terminal del backend)
- ✅ Se guarda en `/backend-node/uploads/profiles/`
- ✅ Se actualiza `photoURL` en la base de datos
- ✅ Se actualiza en Redux
- ✅ La imagen se muestra en toda la app

### Verificar en el backend (Terminal)
```
📸 Recibiendo foto de perfil...
👤 Usuario ID: 1
📁 Archivo guardado: profile-1-1234567890.jpg
🔗 URL de la foto: /uploads/profiles/profile-1-1234567890.jpg
✅ Base de datos actualizada
✅ Foto subida exitosamente
```

### Verificar en el navegador
Abre: `http://192.168.1.6:3000/uploads/profiles/nombre-archivo.jpg`

Deberías ver la imagen.

## 🐛 Troubleshooting

### La foto sale en negro
- **Problema**: La URL no se está construyendo correctamente
- **Solución**: Verifica que `getFullPhotoURL()` esté construyendo la URL completa

### Error 404 al cargar imagen
- **Problema**: El servidor no está sirviendo los archivos estáticos
- **Solución**: Verifica que `server.js` tenga:
  ```javascript
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  ```

### No se guarda en la BD
- **Problema**: El campo `photoURL` es NULL
- **Solución**: Verifica los logs del backend para ver si hay errores

## 📱 URLs de ejemplo

### Desarrollo local:
- Backend: `http://192.168.1.6:3000`
- Foto: `http://192.168.1.6:3000/uploads/profiles/profile-1-1234567890.jpg`

### Producción (cuando despliegues):
- Backend: `https://tudominio.com`
- Foto: `https://tudominio.com/uploads/profiles/profile-1-1234567890.jpg`
