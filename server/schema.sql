-- SASI-INEI v2 — Schema PostgreSQL
-- Ejecutar: psql -U postgres -f server/schema.sql

DROP DATABASE IF EXISTS sasi_inei;
CREATE DATABASE sasi_inei;
\c sasi_inei;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE empleados (
  dni VARCHAR(8) PRIMARY KEY,
  nombres VARCHAR(200) NOT NULL,
  cargo VARCHAR(150),
  correo VARCHAR(150),
  telefono VARCHAR(30),
  vinculo VARCHAR(50),
  oficina VARCHAR(200),
  sede VARCHAR(100),
  orden_servicio VARCHAR(50),
  fecha_inicio_contrato DATE,
  fecha_fin_contrato DATE,
  tipo_acceso VARCHAR(20) DEFAULT 'temporal',
  activo BOOLEAN DEFAULT true
);

CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  clave_hash VARCHAR(200) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  rol VARCHAR(30) DEFAULT 'admin'
);

CREATE TABLE solicitudes (
  id TEXT PRIMARY KEY,
  dni VARCHAR(8) REFERENCES empleados(dni),
  fecha DATE,
  operacion VARCHAR(30),
  oficina VARCHAR(200),
  sede VARCHAR(100),
  nombres VARCHAR(200),
  vinculo VARCHAR(50),
  orden_servicio VARCHAR(50),
  cargo VARCHAR(150),
  correo VARCHAR(150),
  telefono VARCHAR(30),
  justificacion TEXT,
  periodo_inicio DATE,
  periodo_fin DATE,
  fecha_inicio_contrato DATE,
  tipo_acceso VARCHAR(20),
  status VARCHAR(30) DEFAULT 'borrador',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archivo_firmado_nombre VARCHAR(200),
  admin_comentario TEXT,
  admin_id INTEGER REFERENCES admins(id),
  tecnico_asignado VARCHAR(150)
);

CREATE TABLE solicitud_servicios (
  id SERIAL PRIMARY KEY,
  solicitud_id TEXT REFERENCES solicitudes(id) ON DELETE CASCADE,
  servicio_id TEXT NOT NULL
);

CREATE TABLE solicitud_detalles (
  id SERIAL PRIMARY KEY,
  solicitud_id TEXT REFERENCES solicitudes(id) ON DELETE CASCADE,
  servicio_id TEXT NOT NULL,
  detalle JSONB DEFAULT '{}'
);

CREATE TABLE perfil_ti (
  id SERIAL PRIMARY KEY,
  dni VARCHAR(8) REFERENCES empleados(dni),
  servicio_id TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  solicitud_origen TEXT REFERENCES solicitudes(id),
  fecha_otorgado DATE DEFAULT CURRENT_DATE,
  vigencia DATE,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE historial_estados (
  id SERIAL PRIMARY KEY,
  solicitud_id TEXT REFERENCES solicitudes(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30),
  admin_id INTEGER REFERENCES admins(id),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_solicitudes_dni ON solicitudes(dni);
CREATE INDEX idx_solicitudes_status ON solicitudes(status);
CREATE INDEX idx_perfil_ti_dni ON perfil_ti(dni);
CREATE INDEX idx_historial_solicitud ON historial_estados(solicitud_id);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO empleados (dni, nombres, cargo, correo, telefono, vinculo, oficina, sede, orden_servicio, fecha_inicio_contrato, fecha_fin_contrato, tipo_acceso) VALUES
('45678901', 'Carlos Alberto Mendoza Ríos', 'Analista de Sistemas', 'cmendoza@inei.gob.pe', '2017', 'Nombrado', 'Oficina Técnica de Informática', 'Sede Central', '', '2020-03-01', NULL, 'Permanente'),
('32165498', 'María Elena Torres Gutiérrez', 'Especialista en Estadística', 'mtorres@inei.gob.pe', '2045', 'Nombrado', 'Dirección Nacional de Censos y Encuestas', 'Sede Central', '', '2018-06-15', NULL, 'Permanente'),
('78945612', 'Juan Pedro García López', 'Coordinador de Proyectos', 'jgarcia@inei.gob.pe', '3012', 'CAS', 'Dirección Técnica de Demografía e Indicadores Sociales', 'Sede Arenales', '', '2026-01-02', '2026-12-31', 'temporal'),
('15935745', 'Rosa Angélica Huamán Chávez', 'Asistente Administrativo', 'rhuaman@inei.gob.pe', '1089', 'CAS', 'Oficina Técnica de Administración', 'Sede Central', '', '2026-01-02', '2026-12-31', 'temporal'),
('95175346', 'Luis Fernando Paredes Soto', 'Consultor en Base de Datos', 'lparedes@inei.gob.pe', '2078', 'Locador / O.S.', 'Oficina Técnica de Informática', 'Sede Central', 'OS-2026-0045', '2026-02-01', '2026-07-31', 'temporal'),
('36925814', 'Ana Sofía Vargas Medina', 'Analista Programador', 'avargas@inei.gob.pe', '2034', 'CAS', 'Oficina Técnica de Informática', 'Sede Salas', '', '2026-01-02', '2026-12-31', 'temporal'),
('74185296', 'Roberto Enrique Díaz Flores', 'Jefe de Unidad de Redes', 'rdiaz@inei.gob.pe', '2001', 'Nombrado', 'Oficina Técnica de Informática', 'Sede Central', '', '2015-08-10', NULL, 'Permanente'),
('85274196', 'Patricia Carmen Rojas Villanueva', 'Especialista en Cartografía', 'projas@inei.gob.pe', '4015', 'Nombrado', 'Dirección Nacional de Censos y Encuestas', 'Sede Arenales', '', '2019-04-01', NULL, 'Permanente'),
('65432198', 'Diego Armando Salazar Peña', 'Técnico en Soporte', 'dsalazar@inei.gob.pe', '2056', 'CAS', 'Oficina Técnica de Informática', 'Sede Central', '', '2026-01-02', '2026-12-31', 'temporal'),
('12348765', 'Claudia Isabel Fernández Quispe', 'Consultora de Sistemas', 'cfernandez@inei.gob.pe', '2090', 'Locador / O.S.', 'Dirección Técnica de Indicadores Económicos', 'Sede Central', 'OS-2026-0112', '2026-03-01', '2026-08-31', 'temporal');

-- Admin seed: password 'admin123' hashed with bcryptjs
INSERT INTO admins (usuario, clave_hash, nombre, rol) VALUES
('admin', '$2a$10$gLvTjmFl6QAc1wdrGodVWuIdOwWW/WZ3mxMG22vIqQLcnd8JY682e', 'Administrador OTIN', 'admin');

-- ============================================================
-- CASO 1: Carlos Mendoza (Nombrado, sin O.S.)
-- Solicitud ATENDIDA completa — ya tiene perfil TI activo
-- Creación de Cuenta Red + Internet + VPN
-- ============================================================
INSERT INTO solicitudes (id, dni, fecha, operacion, oficina, sede, nombres, vinculo, orden_servicio, cargo, correo, telefono, justificacion, periodo_inicio, periodo_fin, fecha_inicio_contrato, tipo_acceso, status, created_at, updated_at, admin_comentario, admin_id, tecnico_asignado)
VALUES (
  'SOL-100001', '45678901', '2026-02-10', 'Creación',
  'Oficina Técnica de Informática', 'Sede Central',
  'Carlos Alberto Mendoza Ríos', 'Nombrado', '',
  'Analista de Sistemas', 'cmendoza@inei.gob.pe', '2017',
  'Requiero acceso a red, internet perfil avanzado y VPN para labores de administración de sistemas y soporte remoto a sedes descentralizadas.',
  '2026-02-10', NULL, '2020-03-01', 'Permanente',
  'atendido', '2026-02-10 09:00:00', '2026-02-12 14:30:00',
  NULL, 1, 'Diego Salazar'
);

INSERT INTO solicitud_servicios (solicitud_id, servicio_id) VALUES
('SOL-100001', 'c1'),
('SOL-100001', 'c4');

INSERT INTO solicitud_detalles (solicitud_id, servicio_id, detalle) VALUES
('SOL-100001', 'c1', '{"tipoOperacion":"Creación","cuentaRed":true,"tipoCuenta":"Personal","internet":true,"perfilInternet":"1","redesSociales":"Sin redes sociales","justificacionInternet":"Acceso para administración de servidores, monitoreo de red y descarga de actualizaciones de seguridad.","correoInst":true,"tipoCorreo":"Creación de cuenta"}'),
('SOL-100001', 'c4', '{"fechaInicio":"2026-02-10","fechaFin":"","justificacion":"Soporte remoto a sedes regionales fuera de horario y ante emergencias de infraestructura."}');

-- Perfil TI activo de Carlos (servicios ya otorgados)
INSERT INTO perfil_ti (dni, servicio_id, config, solicitud_origen, fecha_otorgado, vigencia, activo) VALUES
('45678901', 'c1', '{"tipoOperacion":"Creación","cuentaRed":true,"tipoCuenta":"Personal","internet":true,"perfilInternet":"1","redesSociales":"Sin redes sociales","correoInst":true,"tipoCorreo":"Creación de cuenta"}', 'SOL-100001', '2026-02-12', NULL, true),
('45678901', 'c4', '{"fechaInicio":"2026-02-10","justificacion":"Soporte remoto a sedes regionales."}', 'SOL-100001', '2026-02-12', NULL, true);

-- Historial de la solicitud
INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo, admin_id, comentario, created_at) VALUES
('SOL-100001', 'borrador', 'enviado', NULL, NULL, '2026-02-10 09:05:00'),
('SOL-100001', 'enviado', 'en_revision', 1, NULL, '2026-02-11 10:00:00'),
('SOL-100001', 'en_revision', 'aprobado', 1, NULL, '2026-02-12 14:00:00'),
('SOL-100001', 'aprobado', 'atendido', 1, NULL, '2026-02-12 14:30:00');

-- ============================================================
-- CASO 2: Carlos Mendoza — Solicitud de ACTUALIZACIÓN
-- Quiere subir su perfil de internet a "Con redes sociales"
-- Estado: ENVIADO (pendiente de revisión admin)
-- ============================================================
INSERT INTO solicitudes (id, dni, fecha, operacion, oficina, sede, nombres, vinculo, orden_servicio, cargo, correo, telefono, justificacion, periodo_inicio, periodo_fin, fecha_inicio_contrato, tipo_acceso, status, created_at, updated_at)
VALUES (
  'SOL-100002', '45678901', '2026-03-03', 'Actualización',
  'Oficina Técnica de Informática', 'Sede Central',
  'Carlos Alberto Mendoza Ríos', 'Nombrado', '',
  'Analista de Sistemas', 'cmendoza@inei.gob.pe', '2017',
  'Se requiere habilitar redes sociales en el perfil de internet para gestión de comunicaciones institucionales del área y monitoreo de incidentes reportados en redes.',
  '2026-03-03', NULL, '2020-03-01', 'Permanente',
  'enviado', '2026-03-03 08:30:00', '2026-03-03 08:30:00'
);

INSERT INTO solicitud_servicios (solicitud_id, servicio_id) VALUES
('SOL-100002', 'c1');

INSERT INTO solicitud_detalles (solicitud_id, servicio_id, detalle) VALUES
('SOL-100002', 'c1', '{"tipoOperacion":"Actualización","cuentaRed":false,"internet":true,"perfilInternet":"1","redesSociales":"Con redes sociales","justificacionInternet":"Gestión de comunicaciones institucionales y monitoreo de incidentes en redes sociales.","correoInst":false}');

INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo, admin_id, comentario, created_at) VALUES
('SOL-100002', 'borrador', 'enviado', NULL, NULL, '2026-03-03 08:30:00');

-- ============================================================
-- CASO 3: Luis Fernando Paredes (Locador/O.S., CON orden de servicio)
-- Solicitud COMPLETA enviada — Creación de BD + Carpeta FTP
-- Estado: ENVIADO (listo para que admin apruebe)
-- ============================================================
INSERT INTO solicitudes (id, dni, fecha, operacion, oficina, sede, nombres, vinculo, orden_servicio, cargo, correo, telefono, justificacion, periodo_inicio, periodo_fin, fecha_inicio_contrato, tipo_acceso, status, created_at, updated_at)
VALUES (
  'SOL-100003', '95175346', '2026-03-01', 'Creación',
  'Oficina Técnica de Informática', 'Sede Central',
  'Luis Fernando Paredes Soto', 'Locador / O.S.', 'OS-2026-0045',
  'Consultor en Base de Datos', 'lparedes@inei.gob.pe', '2078',
  'Requiero acceso a base de datos de producción del servidor DBPROD01 para consultoría de optimización de queries del módulo de encuestas, y carpeta FTP para transferencia de scripts y respaldos.',
  '2026-03-01', '2026-07-31', '2026-02-01', 'temporal',
  'enviado', '2026-03-01 11:00:00', '2026-03-01 11:00:00'
);

INSERT INTO solicitud_servicios (solicitud_id, servicio_id) VALUES
('SOL-100003', 'c8'),
('SOL-100003', 'c6');

INSERT INTO solicitud_detalles (solicitud_id, servicio_id, detalle) VALUES
('SOL-100003', 'c8', '{"proposito":"Consultoría de optimización de queries y procedimientos almacenados del módulo de encuestas nacionales.","servidor":"DBPROD01","baseDatos":"ENCUESTAS_NAC","ambiente":"Producción","tipoAcceso":"Temporal","fechaInicio":"2026-03-01","fechaFin":"2026-07-31","permisos":["(i) Lectura de tablas y vistas","(iii) Ejecución de procedimientos y funciones"],"objetos":"tbl_encuesta_2026, vw_resultados_departamento, sp_procesar_encuesta"}'),
('SOL-100003', 'c6', '{"subTipo":"generacion","jefeArea":"Roberto Enrique Díaz Flores","proposito":"Carpeta para transferencia de scripts SQL, respaldos parciales y reportes de optimización entre el consultor y el equipo DBA.","usuarios":[{"area":"Oficina Técnica de Informática","proyecto":"Optimización BD Encuestas","dni":"95175346","nombre":"Luis Fernando","apellidos":"Paredes Soto","lectura":true,"escritura":true},{"area":"Oficina Técnica de Informática","proyecto":"Optimización BD Encuestas","dni":"74185296","nombre":"Roberto Enrique","apellidos":"Díaz Flores","lectura":true,"escritura":false}]}');

INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo, admin_id, comentario, created_at) VALUES
('SOL-100003', 'borrador', 'enviado', NULL, NULL, '2026-03-01 11:00:00');

-- ============================================================
-- CASO 4: Rosa Huamán (CAS, sin O.S.)
-- Solicitud en BORRADOR — apenas empezó, casi vacía
-- Solo eligió operación y sede, sin servicios aún
-- ============================================================
INSERT INTO solicitudes (id, dni, fecha, operacion, oficina, sede, nombres, vinculo, orden_servicio, cargo, correo, telefono, justificacion, periodo_inicio, periodo_fin, fecha_inicio_contrato, tipo_acceso, status, created_at, updated_at)
VALUES (
  'SOL-100004', '15935745', '2026-03-04', 'Creación',
  'Oficina Técnica de Administración', 'Sede Central',
  'Rosa Angélica Huamán Chávez', 'CAS', '',
  'Asistente Administrativo', 'rhuaman@inei.gob.pe', '1089',
  '', NULL, '2026-12-31', '2026-01-02', 'temporal',
  'borrador', '2026-03-04 08:00:00', '2026-03-04 08:00:00'
);
