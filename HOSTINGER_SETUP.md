# 🔧 Configuración de Hostinger para Conexión Remota MySQL

## Paso 1: Habilitar Acceso Remoto a MySQL en Hostinger

1. **Accede a tu panel de Hostinger**
   - Ve a: https://hpanel.hostinger.com

2. **Navega a la configuración de MySQL**
   - Hosting → Advanced → **Remote MySQL**

3. **Agrega tu IP pública**
   - Obtén tu IP actual: https://www.whatismyip.com
   - En Hostinger, haz clic en **"Add Remote MySQL Host"**
   - Ingresa tu IP pública
   - Guarda los cambios

   **NOTA:** Si tu IP cambia (internet móvil, WiFi público), debes actualizarla en Hostinger

4. **Obtén el hostname remoto**
   - En la misma sección, copia el **Remote MySQL Hostname**
   - Ejemplo: `srv1553.hstgr.io` o similar
   - Actualiza `DB_HOST` en tu archivo `.env` con este valor

## Paso 2: Actualizar configuración del Backend

Tu archivo `.env` debe tener:
```env
DB_HOST=srv1553.hstgr.io  # El hostname que obtuviste de Hostinger
DB_USER=u779607948_kelvim
DB_PASSWORD=Cortana1903
DB_NAME=u779607948_gamingApp
DB_PORT=3306
```

## Paso 3: Probar la conexión

```bash
cd backend-node
npm run dev
```

Deberías ver:
```
✅ Conexión exitosa a MySQL
🚀 Servidor corriendo en http://localhost:3000
```

## Problemas Comunes

### Error: "Access denied for user"
- Verifica que las credenciales sean correctas
- Asegúrate de que tu IP esté en la lista de IPs permitidas

### Error: "Can't connect to MySQL server"
- Verifica el hostname remoto
- Confirma que Remote MySQL esté habilitado
- Revisa que el puerto 3306 no esté bloqueado por tu firewall

### Error: "Host is not allowed to connect"
- Tu IP no está en la lista de IPs permitidas
- Ve a Remote MySQL y agrégala

## Alternativa: IP Dinámica

Si tu IP cambia frecuentemente, puedes:

1. **Usar % como wildcard** (menos seguro)
   - En algunos paneles permite `%` para permitir cualquier IP
   
2. **Usar un servicio VPN con IP fija**
   - Así tu IP no cambia

3. **Script de actualización automática**
   - Usar la API de Hostinger para actualizar tu IP automáticamente
