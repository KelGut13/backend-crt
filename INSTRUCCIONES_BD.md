# Instrucciones para Actualizar la Base de Datos

## Cambios necesarios en la base de datos MySQL:

Ejecuta este script SQL en tu base de datos `u779607948_gamingApp` en Hostinger:

```sql
-- 1. Agregar campo 'estado' a la tabla amigos
ALTER TABLE amigos 
ADD COLUMN estado ENUM('pendiente', 'aceptada') DEFAULT 'pendiente' AFTER usuario2;

-- 2. Actualizar registros existentes a 'aceptada' (asumiendo que ya son amigos)
UPDATE amigos SET estado = 'aceptada' WHERE estado IS NULL;

-- 3. Agregar campo 'isOnline' a la tabla users
ALTER TABLE users 
ADD COLUMN isOnline BOOLEAN DEFAULT FALSE AFTER photoURL;

-- 4. Agregar campo 'lastSeen' para saber cuándo estuvo en línea por última vez
ALTER TABLE users 
ADD COLUMN lastSeen TIMESTAMP NULL DEFAULT NULL AFTER isOnline;
```

## Cómo ejecutar:

1. Ve a tu panel de Hostinger
2. Accede a phpMyAdmin
3. Selecciona la base de datos `u779607948_gamingApp`
4. Ve a la pestaña "SQL"
5. Copia y pega el script anterior
6. Haz clic en "Ejecutar" (Go)

## Verificación:

Después de ejecutar el script, verifica que:
- La tabla `amigos` tiene el campo `estado`
- La tabla `users` tiene los campos `isOnline` y `lastSeen`

Puedes verificar con:
```sql
DESCRIBE amigos;
DESCRIBE users;
```
