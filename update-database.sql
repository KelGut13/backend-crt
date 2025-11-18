-- Agregar campo 'estado' a la tabla amigos si no existe
ALTER TABLE amigos 
ADD COLUMN IF NOT EXISTS estado ENUM('pendiente', 'aceptada') DEFAULT 'pendiente' AFTER usuario2;

-- Actualizar registros existentes a 'aceptada' (asumiendo que ya son amigos)
UPDATE amigos SET estado = 'aceptada' WHERE estado IS NULL OR estado = '';

-- Agregar campo 'isOnline' a la tabla users si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS isOnline BOOLEAN DEFAULT FALSE AFTER photoURL;

-- Agregar campo 'lastSeen' para saber cuándo estuvo en línea por última vez
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS lastSeen TIMESTAMP NULL DEFAULT NULL AFTER isOnline;

-- Agregar campo 'leido' a la tabla mensajes para saber si un mensaje fue leído
ALTER TABLE mensajes 
ADD COLUMN IF NOT EXISTS leido BOOLEAN DEFAULT FALSE AFTER mensaje;

-- Agregar campo 'eliminadoPara' para trackear quién eliminó el mensaje
-- JSON: {"userId1": true, "userId2": true} indica que el mensaje está eliminado para esos usuarios
ALTER TABLE mensajes 
ADD COLUMN IF NOT EXISTS eliminadoPara JSON NULL AFTER leido;

-- Agregar campo 'eliminado' para marcar mensajes eliminados para todos (soft delete)
ALTER TABLE mensajes 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE AFTER eliminadoPara;
