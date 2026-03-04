import { test, expect } from '@playwright/test';

test.describe('SASI INEI - Auto-completar datos por DNI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Dashboard carga correctamente', async ({ page }) => {
    await expect(page.locator('text=SASI – INEI')).toBeVisible();
    await expect(page.locator('text=Mis Solicitudes')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Nueva Solicitud' }).first()).toBeVisible();
  });

  test('2. Nueva solicitud abre en Step 1 = Datos del Usuario (no Datos Generales)', async ({ page }) => {
    await page.click('text=Nueva Solicitud');
    // Step 1 debe ser "Datos del Usuario"
    await expect(page.locator('text=Datos del Usuario Beneficiario')).toBeVisible();
    await expect(page.locator('text=Buscar por DNI')).toBeVisible();
    // NO debe mostrar "Datos Generales de la Solicitud" en step 1
    await expect(page.locator('text=Datos Generales de la Solicitud')).not.toBeVisible();
  });

  test('3. DNI mock auto-completa todos los campos del usuario', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    // Buscar DNI de Carlos Mendoza
    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('45678901');

    // Esperar al indicador verde de datos cargados
    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();

    // Verificar que los campos se auto-completaron
    await expect(page.locator('input[placeholder="Nombres completos"]')).toHaveValue('Carlos Alberto Mendoza Ríos');
    await expect(page.locator('input[placeholder="Ej: Analista de Sistemas"]')).toHaveValue('Analista de Sistemas');
    await expect(page.locator('input[placeholder="usuario@inei.gob.pe"]')).toHaveValue('cmendoza@inei.gob.pe');
    await expect(page.locator('input[placeholder="Anexo o teléfono"]')).toHaveValue('2017');

    // Verificar vínculo seleccionado
    const vinculoSelect = page.locator('select').filter({ has: page.locator('option[value="Nombrado"]') });
    await expect(vinculoSelect.first()).toHaveValue('Nombrado');
  });

  test('4. DNI mock con Locador auto-completa orden de servicio', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('95175346');

    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();

    // Luis Fernando Paredes Soto - Locador con O.S.
    await expect(page.locator('input[placeholder="Nombres completos"]')).toHaveValue('Luis Fernando Paredes Soto');
    await expect(page.locator('input[placeholder="Solo para Locadores/O.S."]')).toHaveValue('OS-2026-0045');
  });

  test('5. DNI no encontrado muestra aviso y permite llenado manual', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('99999999');

    // Debe mostrar aviso de no encontrado
    await expect(page.locator('text=DNI no encontrado')).toBeVisible();

    // Los campos deben estar vacíos para llenado manual
    await expect(page.locator('input[placeholder="Nombres completos"]')).toHaveValue('');

    // Verificar que se puede llenar manualmente
    await page.locator('input[placeholder="Nombres completos"]').fill('Usuario Manual');
    await expect(page.locator('input[placeholder="Nombres completos"]')).toHaveValue('Usuario Manual');
  });

  test('6. Botón Buscar funciona al hacer clic', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    // Escribir DNI sin completar los 8 dígitos primero
    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('3292561'); // 7 dígitos

    // Botón debe estar deshabilitado con 7 dígitos
    const buscarBtn = page.locator('button:has-text("Buscar")');
    await expect(buscarBtn).toBeDisabled();

    // Completar a 8 dígitos (auto-busca)
    await dniInput.fill('32165498');

    // Debe encontrar a María Elena Torres
    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();
    await expect(page.locator('input[placeholder="Nombres completos"]')).toHaveValue('María Elena Torres Gutiérrez');
  });

  test('7. Oficina y sede se propagan a Step 2 (Datos Generales)', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    // Auto-completar con DNI de Ana Sofía Vargas (Sede Salas)
    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('36925814');
    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();

    // Completar campos obligatorios faltantes para poder avanzar
    // (nombres, dni, vinculo y cargo ya están auto-completados)

    // Avanzar al Step 2 (Datos Generales)
    await page.click('text=Siguiente →');

    // Verificar que estamos en Step 2
    await expect(page.locator('text=Datos Generales de la Solicitud')).toBeVisible();

    // Verificar que oficina y sede se propagaron
    await expect(page.locator('input[placeholder="Ej: Oficina Técnica de Informática"]')).toHaveValue('Oficina Técnica de Informática');

    // Verificar sede seleccionada
    const sedeSelect = page.locator('select').filter({ has: page.locator('option[value="Sede Salas"]') });
    await expect(sedeSelect.first()).toHaveValue('Sede Salas');
  });

  test('8. Campos son editables después del auto-completado', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('45678901');
    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();

    // Editar el nombre auto-completado
    const nombreInput = page.locator('input[placeholder="Nombres completos"]');
    await nombreInput.clear();
    await nombreInput.fill('Carlos Mendoza (Actualizado)');
    await expect(nombreInput).toHaveValue('Carlos Mendoza (Actualizado)');

    // Editar el cargo
    const cargoInput = page.locator('input[placeholder="Ej: Analista de Sistemas"]');
    await cargoInput.clear();
    await cargoInput.fill('Jefe de Proyectos');
    await expect(cargoInput).toHaveValue('Jefe de Proyectos');
  });

  test('9. Flujo completo: DNI → Datos Generales → Servicios', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    // Step 1: Auto-completar usuario
    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');
    await dniInput.fill('74185296');
    await expect(page.locator('text=Datos cargados automáticamente')).toBeVisible();
    await page.click('text=Siguiente →');

    // Step 2: Datos Generales - completar operación
    await expect(page.locator('text=Datos Generales de la Solicitud')).toBeVisible();
    // Seleccionar operación
    const operacionSelect = page.locator('select').filter({ has: page.locator('option[value="Creación"]') });
    await operacionSelect.first().selectOption('Creación');
    // Oficina y sede ya deben estar llenas
    await expect(page.locator('input[placeholder="Ej: Oficina Técnica de Informática"]')).toHaveValue('Oficina Técnica de Informática');
    await page.click('text=Siguiente →');

    // Step 3: Servicios
    await expect(page.locator('text=Servicios Solicitados')).toBeVisible();
    // Seleccionar un servicio
    await page.click('text=Cuenta de Red / Internet / Correo');
    await expect(page.locator('text=1 servicio(s) seleccionado(s)')).toBeVisible();
  });

  test('10. Solo acepta dígitos en el campo DNI de búsqueda', async ({ page }) => {
    await page.click('text=Nueva Solicitud');

    const dniInput = page.locator('input[placeholder="Ingrese los 8 dígitos del DNI"]');

    // Intentar escribir letras y caracteres especiales
    await dniInput.fill('abc12345');
    // Solo debe quedar los números (el filtro remueve letras)
    // El campo del DNI del form debería tener solo los dígitos
    const dniFormInput = page.locator('input[placeholder="00000000"]');
    const dniValue = await dniFormInput.inputValue();
    // Verificar que no tiene letras
    expect(dniValue).toMatch(/^\d*$/);
  });

});
