-- Crear tabla para códigos de recuperación de contraseña
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
