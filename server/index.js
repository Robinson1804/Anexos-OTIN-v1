import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __serverDir = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend in production
app.use(express.static(join(__serverDir, '..', 'dist')));

// ============================================================
// AUTH
// ============================================================

// Login usuario por DNI
app.post('/api/login/usuario', async (req, res) => {
  try {
    const { dni } = req.body;
    if (!dni || dni.length !== 8) return res.status(400).json({ error: 'DNI inválido' });
    const { rows } = await pool.query('SELECT * FROM empleados WHERE dni = $1 AND activo = true', [dni]);
    if (rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    const emp = rows[0];
    res.json({
      rol: 'usuario',
      datos: {
        dni: emp.dni, nombres: emp.nombres, cargo: emp.cargo, correo: emp.correo,
        telefono: emp.telefono, vinculo: emp.vinculo, oficina: emp.oficina, sede: emp.sede,
        ordenServicio: emp.orden_servicio || '', fechaInicio: emp.fecha_inicio_contrato,
        fechaFin: emp.fecha_fin_contrato, tipoAcceso: emp.tipo_acceso,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Login admin
app.post('/api/login/admin', async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    if (!usuario || !clave) return res.status(400).json({ error: 'Credenciales requeridas' });
    const { rows } = await pool.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const admin = rows[0];
    const valid = await bcrypt.compare(clave, admin.clave_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json({
      rol: 'admin',
      datos: { id: admin.id, usuario: admin.usuario, nombre: admin.nombre, rol: admin.rol },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================
// EMPLEADOS
// ============================================================

app.get('/api/empleados/:dni', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados WHERE dni = $1', [req.params.dni]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const emp = rows[0];
    res.json({
      dni: emp.dni, nombres: emp.nombres, cargo: emp.cargo, correo: emp.correo,
      telefono: emp.telefono, vinculo: emp.vinculo, oficina: emp.oficina, sede: emp.sede,
      ordenServicio: emp.orden_servicio || '', fechaInicio: emp.fecha_inicio_contrato,
      fechaFin: emp.fecha_fin_contrato, tipoAcceso: emp.tipo_acceso, activo: emp.activo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/empleados', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY nombres');
    res.json(rows.map(emp => ({
      dni: emp.dni, nombres: emp.nombres, cargo: emp.cargo, correo: emp.correo,
      telefono: emp.telefono, vinculo: emp.vinculo, oficina: emp.oficina, sede: emp.sede,
      ordenServicio: emp.orden_servicio || '', fechaInicio: emp.fecha_inicio_contrato,
      fechaFin: emp.fecha_fin_contrato, tipoAcceso: emp.tipo_acceso, activo: emp.activo,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/empleados', async (req, res) => {
  try {
    const { dni, nombres, cargo, correo, telefono, vinculo, oficina, sede, ordenServicio, fechaInicio, fechaFin, tipoAcceso } = req.body;
    await pool.query(
      `INSERT INTO empleados (dni, nombres, cargo, correo, telefono, vinculo, oficina, sede, orden_servicio, fecha_inicio_contrato, fecha_fin_contrato, tipo_acceso)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [dni, nombres, cargo, correo, telefono, vinculo, oficina, sede, ordenServicio || '', fechaInicio || null, fechaFin || null, tipoAcceso || 'temporal']
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.put('/api/empleados/:dni', async (req, res) => {
  try {
    const { nombres, cargo, correo, telefono, vinculo, oficina, sede, ordenServicio, fechaInicio, fechaFin, tipoAcceso, activo } = req.body;
    await pool.query(
      `UPDATE empleados SET nombres=$1, cargo=$2, correo=$3, telefono=$4, vinculo=$5, oficina=$6, sede=$7, orden_servicio=$8, fecha_inicio_contrato=$9, fecha_fin_contrato=$10, tipo_acceso=$11, activo=$12
       WHERE dni=$13`,
      [nombres, cargo, correo, telefono, vinculo, oficina, sede, ordenServicio || '', fechaInicio || null, fechaFin || null, tipoAcceso || 'temporal', activo !== false, req.params.dni]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================
// SOLICITUDES
// ============================================================

// Obtener solicitudes (filtro por DNI o todas)
app.get('/api/solicitudes', async (req, res) => {
  try {
    const { dni } = req.query;
    let solRows;
    if (dni) {
      solRows = (await pool.query('SELECT * FROM solicitudes WHERE dni = $1 ORDER BY created_at DESC', [dni])).rows;
    } else {
      solRows = (await pool.query('SELECT * FROM solicitudes ORDER BY created_at DESC')).rows;
    }

    const result = [];
    for (const sol of solRows) {
      const servicios = (await pool.query('SELECT servicio_id FROM solicitud_servicios WHERE solicitud_id = $1', [sol.id])).rows.map(r => r.servicio_id);
      const detallesRows = (await pool.query('SELECT servicio_id, detalle FROM solicitud_detalles WHERE solicitud_id = $1', [sol.id])).rows;
      const detalles = {};
      detallesRows.forEach(r => { detalles[r.servicio_id] = r.detalle; });

      result.push({
        id: sol.id, dni: sol.dni, fecha: sol.fecha, operacion: sol.operacion,
        oficina: sol.oficina, sede: sol.sede, nombres: sol.nombres, vinculo: sol.vinculo,
        ordenServicio: sol.orden_servicio || '', cargo: sol.cargo, correo: sol.correo,
        telefono: sol.telefono, justificacion: sol.justificacion,
        periodoInicio: sol.periodo_inicio, periodoFin: sol.periodo_fin,
        fechaInicioContrato: sol.fecha_inicio_contrato, tipoAcceso: sol.tipo_acceso,
        status: sol.status, createdAt: new Date(sol.created_at).getTime(),
        archivoFirmadoNombre: sol.archivo_firmado_nombre,
        adminComentario: sol.admin_comentario, tecnicoAsignado: sol.tecnico_asignado,
        servicios, detalles,
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear solicitud
app.post('/api/solicitudes', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const f = req.body;

    await client.query(
      `INSERT INTO solicitudes (id, dni, fecha, operacion, oficina, sede, nombres, vinculo, orden_servicio, cargo, correo, telefono, justificacion, periodo_inicio, periodo_fin, fecha_inicio_contrato, tipo_acceso, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [f.id, f.dni, f.fecha, f.operacion, f.oficina, f.sede, f.nombres, f.vinculo, f.ordenServicio || '', f.cargo, f.correo, f.telefono, f.justificacion, f.periodoInicio || null, f.periodoFin || null, f.fechaInicioContrato || null, f.tipoAcceso, f.status || 'borrador']
    );

    if (f.servicios?.length) {
      for (const svc of f.servicios) {
        await client.query('INSERT INTO solicitud_servicios (solicitud_id, servicio_id) VALUES ($1, $2)', [f.id, svc]);
      }
    }

    if (f.detalles) {
      for (const [svcId, detalle] of Object.entries(f.detalles)) {
        await client.query('INSERT INTO solicitud_detalles (solicitud_id, servicio_id, detalle) VALUES ($1, $2, $3)', [f.id, svcId, JSON.stringify(detalle)]);
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true, id: f.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// Actualizar solicitud
app.put('/api/solicitudes/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const f = req.body;
    const solId = req.params.id;

    await client.query(
      `UPDATE solicitudes SET fecha=$1, operacion=$2, oficina=$3, sede=$4, nombres=$5, vinculo=$6, orden_servicio=$7, cargo=$8, correo=$9, telefono=$10, justificacion=$11, periodo_inicio=$12, periodo_fin=$13, fecha_inicio_contrato=$14, tipo_acceso=$15, status=$16, updated_at=NOW()
       WHERE id=$17`,
      [f.fecha, f.operacion, f.oficina, f.sede, f.nombres, f.vinculo, f.ordenServicio || '', f.cargo, f.correo, f.telefono, f.justificacion, f.periodoInicio || null, f.periodoFin || null, f.fechaInicioContrato || null, f.tipoAcceso, f.status, solId]
    );

    // Replace servicios
    await client.query('DELETE FROM solicitud_servicios WHERE solicitud_id = $1', [solId]);
    if (f.servicios?.length) {
      for (const svc of f.servicios) {
        await client.query('INSERT INTO solicitud_servicios (solicitud_id, servicio_id) VALUES ($1, $2)', [solId, svc]);
      }
    }

    // Replace detalles
    await client.query('DELETE FROM solicitud_detalles WHERE solicitud_id = $1', [solId]);
    if (f.detalles) {
      for (const [svcId, detalle] of Object.entries(f.detalles)) {
        await client.query('INSERT INTO solicitud_detalles (solicitud_id, servicio_id, detalle) VALUES ($1, $2, $3)', [solId, svcId, JSON.stringify(detalle)]);
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// Cambiar estado (admin)
app.put('/api/solicitudes/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const solId = req.params.id;
    const { status, comentario, adminId, tecnicoAsignado } = req.body;

    // Get current status
    const { rows } = await pool.query('SELECT status, dni FROM solicitudes WHERE id = $1', [solId]);
    if (rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'No encontrada' }); }
    const estadoAnterior = rows[0].status;
    const solDni = rows[0].dni;

    // Update solicitud
    const updates = ['status = $1', 'updated_at = NOW()'];
    const params = [status];
    let paramIdx = 2;

    if (comentario !== undefined) { updates.push(`admin_comentario = $${paramIdx}`); params.push(comentario); paramIdx++; }
    if (adminId !== undefined) { updates.push(`admin_id = $${paramIdx}`); params.push(adminId); paramIdx++; }
    if (tecnicoAsignado !== undefined) { updates.push(`tecnico_asignado = $${paramIdx}`); params.push(tecnicoAsignado); paramIdx++; }

    params.push(solId);
    await client.query(`UPDATE solicitudes SET ${updates.join(', ')} WHERE id = $${paramIdx}`, params);

    // Historial
    await client.query(
      'INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo, admin_id, comentario) VALUES ($1, $2, $3, $4, $5)',
      [solId, estadoAnterior, status, adminId || null, comentario || null]
    );

    // Si pasa a "atendido" → actualizar perfil_ti
    if (status === 'atendido') {
      const servicios = (await client.query('SELECT servicio_id FROM solicitud_servicios WHERE solicitud_id = $1', [solId])).rows;
      const detallesRows = (await client.query('SELECT servicio_id, detalle FROM solicitud_detalles WHERE solicitud_id = $1', [solId])).rows;
      const detallesMap = {};
      detallesRows.forEach(r => { detallesMap[r.servicio_id] = r.detalle; });

      const solData = (await client.query('SELECT operacion, periodo_fin FROM solicitudes WHERE id = $1', [solId])).rows[0];
      const operacion = solData.operacion;
      const vigencia = solData.periodo_fin || null;

      for (const { servicio_id } of servicios) {
        const config = detallesMap[servicio_id] || {};

        if (operacion === 'Creación') {
          await client.query(
            'INSERT INTO perfil_ti (dni, servicio_id, config, solicitud_origen, vigencia) VALUES ($1, $2, $3, $4, $5)',
            [solDni, servicio_id, JSON.stringify(config), solId, vigencia]
          );
        } else if (operacion === 'Actualización') {
          // Update existing active perfil or insert new
          const existing = (await client.query('SELECT id FROM perfil_ti WHERE dni = $1 AND servicio_id = $2 AND activo = true LIMIT 1', [solDni, servicio_id])).rows;
          if (existing.length > 0) {
            await client.query('UPDATE perfil_ti SET config = $1, solicitud_origen = $2, vigencia = $3 WHERE id = $4', [JSON.stringify(config), solId, vigencia, existing[0].id]);
          } else {
            await client.query('INSERT INTO perfil_ti (dni, servicio_id, config, solicitud_origen, vigencia) VALUES ($1, $2, $3, $4, $5)', [solDni, servicio_id, JSON.stringify(config), solId, vigencia]);
          }
        } else if (operacion === 'Baja') {
          await client.query('UPDATE perfil_ti SET activo = false WHERE dni = $1 AND servicio_id = $2 AND activo = true', [solDni, servicio_id]);
        } else if (operacion === 'Desactivación') {
          await client.query('UPDATE perfil_ti SET activo = false WHERE dni = $1 AND servicio_id = $2 AND activo = true', [solDni, servicio_id]);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// Eliminar borrador
app.delete('/api/solicitudes/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT status FROM solicitudes WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    if (rows[0].status !== 'borrador') return res.status(400).json({ error: 'Solo se pueden eliminar borradores' });
    await pool.query('DELETE FROM solicitudes WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================
// PERFIL TI
// ============================================================

app.get('/api/perfil-ti/:dni', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM perfil_ti WHERE dni = $1 AND activo = true ORDER BY fecha_otorgado DESC',
      [req.params.dni]
    );
    res.json(rows.map(r => ({
      id: r.id, dni: r.dni, servicioId: r.servicio_id, config: r.config,
      solicitudOrigen: r.solicitud_origen, fechaOtorgado: r.fecha_otorgado,
      vigencia: r.vigencia, activo: r.activo,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================
// HISTORIAL
// ============================================================

app.get('/api/historial/:solicitudId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT h.*, a.nombre as admin_nombre FROM historial_estados h
       LEFT JOIN admins a ON h.admin_id = a.id
       WHERE h.solicitud_id = $1 ORDER BY h.created_at ASC`,
      [req.params.solicitudId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================
// STATS (admin dashboard)
// ============================================================

app.get('/api/stats', async (req, res) => {
  try {
    const total = (await pool.query('SELECT COUNT(*) FROM solicitudes')).rows[0].count;
    const byStatus = (await pool.query('SELECT status, COUNT(*) FROM solicitudes GROUP BY status')).rows;
    const byOficina = (await pool.query('SELECT oficina, COUNT(*) FROM solicitudes GROUP BY oficina ORDER BY count DESC LIMIT 10')).rows;
    const bySede = (await pool.query('SELECT sede, COUNT(*) FROM solicitudes GROUP BY sede ORDER BY count DESC')).rows;

    const mesActual = new Date().toISOString().slice(0, 7);
    const atendidasMes = (await pool.query("SELECT COUNT(*) FROM solicitudes WHERE status = 'atendido' AND TO_CHAR(updated_at, 'YYYY-MM') = $1", [mesActual])).rows[0].count;

    const statusMap = {};
    byStatus.forEach(r => { statusMap[r.status] = parseInt(r.count); });

    res.json({
      total: parseInt(total),
      pendientes: (statusMap.enviado || 0) + (statusMap.en_revision || 0),
      enProceso: statusMap.en_revision || 0,
      atendidasMes: parseInt(atendidasMes),
      rechazadas: statusMap.rechazado || 0,
      aprobadas: statusMap.aprobado || 0,
      byStatus: statusMap,
      byOficina,
      bySede,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// SPA catch-all: serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__serverDir, '..', 'dist', 'index.html'));
});

// ============================================================
// AUTO-SEED: crear tablas y datos si no existen
// ============================================================
import { readFileSync } from 'fs';

async function autoSeed() {
  try {
    const { rows } = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empleados')");
    if (rows[0].exists) {
      // Check if there's data
      const count = await pool.query('SELECT COUNT(*) FROM empleados');
      if (parseInt(count.rows[0].count) > 0) {
        console.log('DB already seeded, skipping.');
        return;
      }
    }
    console.log('Running seed...');
    const sql = readFileSync(join(__serverDir, 'seed.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Seed completed!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// ============================================================
// START
// ============================================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`SASI-INEI API corriendo en puerto ${PORT}`);
  await autoSeed();
});
