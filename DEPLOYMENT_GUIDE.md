# INSTRUCCIONES IMPORTANTES DE DESPLIEGUE

## ⚠️ Problema de Conexión Remota a MySQL

Hostinger **NO permite** conexiones remotas directas a MySQL por razones de seguridad. Solo puedes conectarte a MySQL desde el mismo servidor donde está alojado.

## 🎯 Soluciones

### Opción 1: Desplegar el Backend en Hostinger (RECOMENDADO)

1. **Sube el código del backend a Hostinger:**
   - Accede a tu panel de Hostinger
   - Ve a File Manager
   - Crea una carpeta `/public_html/api`
   - Sube todos los archivos de `backend-node/` excepto `node_modules/`

2. **Instala Node.js en Hostinger:**
   - En el panel de Hostinger, busca "Node.js"
   - Crea una aplicación Node.js
   - Configura el punto de entrada: `server.js`
   - Instala dependencias con npm install

3. **Configura las variables de entorno:**
   - DB_HOST=localhost (ahora sí funcionará porque está en el mismo servidor)
   - El resto de credenciales iguales

4. **Actualiza la URL en la app:**
   - En `lib/api.ts`, cambia `baseURL` a tu dominio real
   - Ejemplo: `https://tudominio.com/api`

### Opción 2: Base de Datos Local para Desarrollo

1. **Instala MySQL localmente:**
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. **Crea la base de datos local:**
   ```bash
   mysql -u root -p
   CREATE DATABASE crt_app_local;
   ```

3. **Importa el esquema:**
   - Usa el archivo de esquema proporcionado para crear las tablas

4. **Actualiza .env para desarrollo:**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password_local
   DB_NAME=crt_app_local
   ```

### Opción 3: Túnel SSH (Para probar con datos de producción)

```bash
ssh -L 3307:localhost:3306 tu-usuario@servidor-hostinger.com
```

Luego en .env:
```
DB_HOST=localhost
DB_PORT=3307
```

## 🚀 Pasos Recomendados AHORA

Para que puedas empezar a desarrollar YA, te sugiero:

1. Instalar MySQL local
2. Importar el esquema
3. Desarrollar y probar localmente
4. Cuando esté listo, desplegar en Hostinger

¿Qué opción prefieres?
