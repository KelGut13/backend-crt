-- Insertar los 13 logros disponibles
-- Primero limpiamos la tabla por si ya existen
TRUNCATE TABLE logros;

INSERT INTO logros (titulo, descripcion, icono) VALUES
('Campeón Urbano', 'Completa 50 carreras urbanas', 'Campeon_Urbano.png'),
('Carrera Perfecta', 'Gana una carrera sin cometer errores', 'Carrera_Perfecta.png'),
('Coleccionista', 'Obtén 10 logros diferentes', 'Coleccionista.png'),
('Comunidad Activa', 'Agrega 10 amigos a tu lista', 'Comunidad_Activa.png'),
('Conectado', 'Inicia sesión 7 días consecutivos', 'Conectado.png'),
('Estratega Urbano', 'Gana 25 carreras usando estrategia', 'Estratega_Urbano.png'),
('Leyenda Nocturna', 'Completa 15 carreras nocturnas', 'Leyenda_Nocturna.png'),
('Maestro de la Calle', 'Alcanza el nivel máximo en habilidad', 'Maestro_de_la_Calle.png'),
('Precisión Total', 'Logra 100% de precisión en 5 carreras', 'Precision_Total.png'),
('Primer Desafío Superado', 'Completa tu primera carrera', 'Primer_Desafio_Superado.png'),
('Reflejos de Trueno', 'Reacciona en menos de 0.2 segundos', 'Reflejos_de_Trueno.png'),
('Rey del Asfalto', 'Gana 100 carreras', 'Rey_del_Asfalto.png'),
('Velocidad Máxima', 'Alcanza la velocidad máxima posible', 'Velocidad_Maxima.png');
