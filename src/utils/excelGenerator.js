import ExcelJS from 'exceljs';

/**
 * excelGenerator.js — Genera el protocolo oficial en Excel siguiendo la plantilla
 * real de PRODHAB (15 hojas originales; acá se generan 11 con datos reales del
 * sistema — ver notas de exclusión más abajo).
 *
 * Hojas EXCLUIDAS a propósito:
 * - "DATOS HIPS": pertenece a otro documento (Política Nacional de CTI), no a
 *   protección de datos personales. No corresponde a este protocolo.
 * - "MENÚ" y "DATOS CELDAS": son navegación interna y listas de validación de
 *   Excel, no contienen datos de un protocolo.
 *
 * Hoja con mapeo PARCIAL:
 * - "BASES DE DATOS": en la plantilla oficial es un inventario INSTITUCIONAL
 *   completo (todas las bases de la entidad), no los datos de un protocolo
 *   individual. El sistema no gestiona ese inventario general, así que esta
 *   hoja se genera solo con encabezados y una nota explicativa.
 * - "EVAL. AMENAZAS": la plantilla oficial usa el cuestionario Douwe Korff /
 *   Manual del DPD (evalúa exposición a amenazas). El sistema usa una
 *   metodología propia (evalúa existencia de controles, Paso 3 del wizard).
 *   Se incluye una nota aclaratoria + un anexo con la evaluación real hecha
 *   en el sistema, en vez de forzar respuestas que no se recolectaron.
 */

const COLOR_NAVY = 'FF1B2A4A';
const COLOR_GOLD = 'FFC9A84C';
const COLOR_WHITE = 'FFFFFFFF';
const COLOR_LIGHT = 'FFF2F3F5';

// ---------- Helpers de estilo ----------

function estiloTituloHoja(ws, texto, colSpan = 8) {
  ws.mergeCells(1, 1, 1, colSpan);
  const cell = ws.getCell(1, 1);
  cell.value = texto;
  cell.font = { bold: true, size: 14, color: { argb: COLOR_WHITE } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_NAVY } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 28;
}

function estiloEncabezados(ws, row, headers) {
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: COLOR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_NAVY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  ws.getRow(row).height = 32;
}

function estiloFila(ws, row, values) {
  values.forEach((v, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = v === undefined || v === null || v === '' ? '' : v;
    cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    cell.border = { top: { style: 'thin', color: { argb: 'FFDDDDDD' } }, bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } }, left: { style: 'thin', color: { argb: 'FFDDDDDD' } }, right: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
  });
}

function notaAmbar(ws, row, texto, colSpan = 8) {
  ws.mergeCells(row, 1, row, colSpan);
  const cell = ws.getCell(row, 1);
  cell.value = texto;
  cell.font = { italic: true, size: 9.5, color: { argb: COLOR_NAVY } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  ws.getRow(row).height = 40;
}

function siNo(v) {
  if (v === true || v === 'SI' || v === 'si' || v === 'Sí' || v === 'sí') return 'SÍ';
  if (v === false || v === 'NO' || v === 'no' || v === 'No') return 'NO';
  return '';
}

async function imagenBase64DesdeUrl(url) {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---------- Generador principal ----------

/**
 * @param {object} formData - el formData completo del wizard (step1_general..step9_revision)
 * @param {object} expediente - el objeto expediente del backend (entidad, anio, numeroExpediente,
 *                               estado, fechaEnvio, fechaModificacion)
 * @param {string} logoUrl - URL importada del logo (import logo from '.../Logo_Prodhab_Azul_Dorado_PNG...')
 */
export async function generarExcelProtocolo(formData, expediente, logoUrl) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema Web de Protocolos de Actuación - PRODHAB';
  wb.created = new Date();

  const g = formData.step1_general || {};
  const inv = (formData.step2_inventario && formData.step2_inventario.bases) || [];
  const am = (formData.step3_amenazas && formData.step3_amenazas.respuestas) || {};
  const fin = formData.step4_finalidad || {};
  const datosRec = fin.datosRecopilados || [];
  const tr = formData.step5_transferencia || {};
  const transferencias = tr.transferencias || [];
  const riesgos = (formData.step6_riesgos && formData.step6_riesgos.riesgos) || [];
  const controles = (formData.step7_seguridad && formData.step7_seguridad.controles) || [];
  const ad = formData.step8_adicionales || {};
  const vulneraciones = ad.vulneraciones || [];
  const planAccion = ad.planAccion || [];
  const controlDocs = ad.controlDocumentos || [];

  let logoBase64 = null;
  if (logoUrl) {
    try {
      logoBase64 = await imagenBase64DesdeUrl(logoUrl);
    } catch (e) {
      console.warn('No se pudo cargar el logo para el Excel:', e);
    }
  }

  // ===== PORTADA =====
  {
    const ws = wb.addWorksheet('PORTADA');
    ws.columns = [{ width: 4 }, { width: 90 }];
    if (logoBase64) {
      const imgId = wb.addImage({ base64: logoBase64, extension: 'png' });
      ws.addImage(imgId, { tl: { col: 0.3, row: 0.5 }, ext: { width: 320, height: 107 } });
    }
    ws.getCell('B8').value = 'PRESENTACIÓN DE DOCUMENTOS DE PROTOCOLOS DE ACTUACIÓN';
    ws.getCell('B8').font = { bold: true, size: 16, color: { argb: COLOR_NAVY } };
    ws.getCell('B10').value = `Entidad: ${expediente.entidad || g.entidad || ''}`;
    ws.getCell('B11').value = `Base de datos: ${g.nombreBD || ''}`;
    ws.getCell('B12').value = `Año: ${expediente.anio || g.ano || ''}`;
    ws.getCell('B13').value = `Número de expediente: ${expediente.numeroExpediente || 'Sin asignar'}`;
    ws.getCell('B14').value = `Estado: ${expediente.estado || ''}`;
    ws.getCell('B15').value = `Fecha de generación: ${new Date().toLocaleDateString('es-CR')}`;
    [10, 11, 12, 13, 14, 15].forEach((r) => {
      ws.getCell(`B${r}`).font = { size: 11, color: { argb: COLOR_NAVY } };
    });
  }

  // ===== GENERAL =====
  {
    const ws = wb.addWorksheet('GENERAL');
    ws.columns = [{ width: 3 }, { width: 32 }, { width: 55 }];
    estiloTituloHoja(ws, 'DATOS GENERALES DE LA BASE DE DATOS', 3);
    const filas = [
      ['Institución', expediente.entidad || g.entidad],
      ['Área', g.area],
      ['Nombre base de datos', g.nombreBD],
      ['Responsable de la base de datos', g.responsable],
      ['Contacto de la base de datos', g.contacto],
      ['Programa / Software (gestor)', g.gestorBD],
      ['Versión del gestor', g.versionBD],
      ['Cantidad de licencias', g.cantidadLicencias],
      ['Cantidad de usuarios con acceso', g.cantidadUsuarios],
      ['Alojamiento', g.alojamiento],
      ['Accesos / permisos', g.acceso],
      ['Mecanismo de ejercicio de derechos (ARCO)', g.mecanismoDerechos],
      ['Fecha de creación de la base de datos', g.fechaCreacion],
    ];
    let r = 3;
    filas.forEach(([label, val]) => {
      ws.getCell(r, 2).value = label;
      ws.getCell(r, 2).font = { bold: true, size: 10 };
      ws.getCell(r, 3).value = val || '';
      ws.getCell(r, 3).alignment = { wrapText: true };
      r++;
    });
  }

  // ===== BASES DE DATOS (fuera de alcance del sistema — solo nota) =====
  {
    const ws = wb.addWorksheet('BASES DE DATOS');
    ws.columns = Array(10).fill({ width: 16 });
    estiloTituloHoja(ws, 'INVENTARIO DE BASES DE DATOS', 10);
    notaAmbar(ws, 2,
      'Esta hoja corresponde al inventario INSTITUCIONAL completo de bases de datos, gestionado por PRODHAB por fuera de este sistema. ' +
      'A continuación se listan únicamente las bases de datos relacionadas registradas en el Paso 2 del protocolo, como referencia.',
      10);
    estiloEncabezados(ws, 4, ['#', 'Nombre', 'Descripción', 'Gestor', 'Versión', 'Ubicación', 'Tipo']);
    inv.forEach((b, i) => {
      estiloFila(ws, 5 + i, [i + 1, b.nombre, b.descripcion, b.gestor, b.version, b.ubicacion, b.tipo]);
    });
  }


  // ===== EVAL. AMENAZAS (mapeo fiel a la plantilla oficial) =====
  {
    const ws = wb.addWorksheet('EVAL. AMENAZAS');
    ws.columns = [{ width: 4 }, { width: 68 }, { width: 12 }];
    estiloTituloHoja(ws, 'TABLA PARA EVALUACIÓN DE AMENAZAS', 3);

    ws.mergeCells(2, 1, 2, 3);
    ws.getCell(2, 1).value = 'Formato de Douwe Korff & Marie Georges — Manual del DPD';
    ws.getCell(2, 1).font = { italic: true, size: 9, color: { argb: COLOR_NAVY } };

    const AMBITOS = [
      { id: 1, letra: 'A', nombre: 'Red y recursos técnicos', preguntas: [
        '¿Hay alguna parte del tratamiento de datos personales que se realice por internet?',
        '¿Es posible dar acceso a un sistema interno de tratamiento de datos personales por internet (por ejemplo, a algunos usuarios o grupos de interés)?',
        '¿El sistema de tratamiento de datos personales está interconectado a otro sistema o servicio TIC externo o interno (de su organización)?',
        '¿Pueden los individuos no autorizados acceder fácilmente al entorno de tratamiento de datos?',
        '¿Se diseña, implementa o mantiene el sistema de tratamiento de datos personales sin seguir las mejores prácticas?',
      ]},
      { id: 2, letra: 'B', nombre: 'Procesos y procedimientos', preguntas: [
        '¿Los roles y responsabilidades con respecto a tratamiento de datos personales son superficiales o no están claramente definidos?',
        '¿El uso aceptable de la red, sistema y recursos físicos a nivel interno de la organización es ambiguo o está definido de forma poco clara?',
        '¿Se permite que los empleados aporten y usen sus propias herramientas para conectarse al sistema de tratamiento de datos personales?',
        '¿Se permite a los empleados transferir, almacenar o realizar otro tipo de tratamiento de datos personales fuera de las instalaciones de la organización?',
        '¿Pueden llevarse a cabo actividades de tratamiento de datos personales sin crear archivos de acceso?',
      ]},
      { id: 3, letra: 'C', nombre: 'Partes y personas involucradas', preguntas: [
        '¿El tratamiento de datos personales es llevado a cabo por un número no definido de empleados?',
        '¿Alguna parte de la operación de tratamiento de datos la lleva a cabo un contratista/tercero (encargado de datos)?',
        '¿Las obligaciones de las partes/personas involucradas en el tratamiento de datos personales son ambiguas o no son del todo claras?',
        '¿El personal que participa en el tratamiento de datos personales no está familiarizado con asuntos de seguridad de la información?',
        '¿Las personas/partes involucradas en la operación de tratamiento de datos olvidan almacenar o destruir de forma segura datos personales?',
      ]},
      { id: 4, letra: 'D', nombre: 'Sector de negocio y escala', preguntas: [
        '¿Considera que su sector de negocio es propenso a ciberataques?',
        '¿Ha sufrido su organización algún ciberataque u otro tipo de brecha de seguridad en los dos últimos años?',
        '¿Ha recibido notificaciones o quejas con respecto a la seguridad del sistema TI (utilizado para el tratamiento de datos personales) durante el último año?',
        '¿Una operación de tratamiento implica a un amplio volumen de individuos o datos personales?',
        '¿Existen mejores prácticas de seguridad específicas para su sector de negocio que no se hayan seguido adecuadamente?',
      ]},
    ];

    const nivelPorCantidad = (n) => (n <= 1 ? 'Bajo' : n <= 3 ? 'Medio' : 'Alto');

    let r = 4;
    let totalSiGlobal = 0;
    AMBITOS.forEach((amb) => {
      ws.mergeCells(r, 1, r, 3);
      ws.getCell(r, 1).value = `${amb.letra}. ${amb.nombre}`;
      ws.getCell(r, 1).font = { bold: true, color: { argb: COLOR_WHITE } };
      ws.getCell(r, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_GOLD } };
      r++;
      let cantidadSi = 0;
      amb.preguntas.forEach((preg, i) => {
        const key = `ambito_${amb.id}_q_${i + 1}`;
        const val = siNo(am[key]);
        if (val === 'SÍ') cantidadSi++;
        ws.getCell(r, 1).value = `${amb.letra}.${i + 1}`;
        ws.getCell(r, 2).value = preg;
        ws.getCell(r, 3).value = val;
        r++;
      });
      totalSiGlobal += cantidadSi;
      ws.getCell(r, 2).value = `Cantidad de respuestas "Sí": ${cantidadSi}  →  Nivel: ${nivelPorCantidad(cantidadSi)}`;
      ws.getCell(r, 2).font = { bold: true, italic: true, size: 9 };
      r += 2;
    });

    const nivelGlobal = totalSiGlobal <= 5 ? 'Bajo' : totalSiGlobal <= 8 ? 'Medio' : 'Alto';
    ws.mergeCells(r, 1, r, 3);
    ws.getCell(r, 1).value = 'EVALUACIÓN DEL RIESGO GLOBAL';
    ws.getCell(r, 1).font = { bold: true, color: { argb: COLOR_WHITE } };
    ws.getCell(r, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_NAVY } };
    r++;
    ws.getCell(r, 2).value = `Sumatoria global: ${totalSiGlobal} de 20  →  Nivel de probabilidad de que ocurra una amenaza: ${nivelGlobal}`;
    ws.getCell(r, 2).font = { bold: true, size: 10, color: { argb: COLOR_NAVY } };
  }

  // ===== FINALIDAD =====
  {
    const ws = wb.addWorksheet('FINALIDAD');
    ws.columns = Array(10).fill({ width: 20 });
    estiloTituloHoja(ws, 'FUNDAMENTACIÓN DE FINES (Finalidad del Tratamiento de Datos Personales)', 10);
    estiloEncabezados(ws, 3, [
      'FINES', 'NORMA HABILITANTE', 'EXCEPCIONES', 'REQUIERE CONSENTIMIENTO',
      'POBLACIÓN INTERVINIENTE', 'CANTIDAD APROX. PERSONAS', 'PARTES INTERESADAS INTERNAS',
      'TRANSFERENCIA', 'ANONIMIZACIÓN', 'OBSERVACIONES',
    ]);
    estiloFila(ws, 4, [
      fin.finalidad, fin.baseLegal, fin.excepciones, siNo(fin.requiereConsentimiento),
      fin.poblacionInterviniente, fin.cantidadAproxPersonas, fin.partesInteresadasInternas,
      siNo(tr.realizaTransferencias), siNo(fin.anonimizacion), fin.observacionesFinalidad,
    ]);
  }

  // ===== DATOS (recopilados) =====
  {
    const ws = wb.addWorksheet('DATOS');
    ws.columns = Array(9).fill({ width: 18 });
    estiloTituloHoja(ws, 'DATOS RECOPILADOS PARA SU TRATAMIENTO', 9);
    estiloEncabezados(ws, 3, [
      'DATO RECOLECTADO', 'TIPO DE DATO', 'FUENTE', 'USO',
      'PERSONAS MENORES DE EDAD', 'PERSONAS CON DISCAPACIDAD', 'PERSONAS FUNCIONARIAS',
      'PERSONAS EN ESTADO DE VULNERABILIDAD', 'VIGENCIA',
    ]);
    datosRec.forEach((d, i) => {
      estiloFila(ws, 4 + i, [
        d.nombre, d.tipo, d.fuente, d.uso,
        siNo(d.personasMenores), siNo(d.personasDiscapacidad), siNo(d.personasFuncionarias),
        siNo(d.personasVulnerables), d.vigencia,
      ]);
    });
  }

  // ===== TRANSFERENCIA =====
  {
    const ws = wb.addWorksheet('TRANSFERENCIA');
    ws.columns = Array(9).fill({ width: 18 });
    estiloTituloHoja(ws, 'TRANSFERENCIA DE DATOS', 9);
    if (!tr.realizaTransferencias) {
      notaAmbar(ws, 2, 'Este protocolo indica que NO se realizan transferencias de datos.', 9);
    } else if (tr.justificacionGeneral) {
      notaAmbar(ws, 2, `Justificación general: ${tr.justificacionGeneral}`, 9);
    }
    estiloEncabezados(ws, 4, [
      'PAÍS / DESTINO', 'NORMA HABILITANTE', 'DOCUMENTOS RESPALDO', 'CONDICIONES DE TRANSFERENCIA',
      'TIPO (NACIONAL/INTERNACIONAL)', 'VIGENCIA', 'CONSIDERACIONES DE SEGURIDAD', 'OBSERVACIONES', 'TIPO DE TRANSFERENCIA',
    ]);
    transferencias.forEach((t, i) => {
      estiloFila(ws, 5 + i, [
        t.pais, t.baseLegal, t.documentosRespaldo, t.condicionesTransferencia,
        t.tipoNacionalInternacional, t.vigencia, t.consideracionesSeguridad,
        t.justificacion || '', t.tipo || '',
      ]);
    });
  }

  // ===== GESTIÓN DE RIESGOS =====
  {
    const ws = wb.addWorksheet('GESTIÓN DE RIESGOS');
    ws.columns = [
      { width: 5 }, { width: 28 }, { width: 26 }, { width: 26 }, { width: 22 },
      { width: 13 }, { width: 14 }, { width: 12 }, { width: 26 }, { width: 20 },
      { width: 13 }, { width: 14 }, { width: 12 }, { width: 22 },
    ];
    estiloTituloHoja(ws, 'MATRIZ DE RIESGOS', 14);
    ws.getCell(2, 2).value = `Nombre de la Base de Datos: ${g.nombreBD || ''}`;
    ws.getCell(2, 2).font = { bold: true };
    ws.getCell(2, 9).value = `Fecha de revisión: ${new Date().toLocaleDateString('es-CR')}`;
    ws.getCell(2, 9).font = { bold: true };
    estiloEncabezados(ws, 4, [
      'ID', 'Situación o evento (Descripción)', 'Condiciones que propician el riesgo',
      'Consecuencias sobre el indicador', 'Medida de control existente',
      'Probabilidad (inherente)', 'Consecuencia (inherente)', 'NRI',
      'Medida de control a aplicar', 'Responsable de aplicar la medida',
      'Probabilidad (residual)', 'Consecuencia (residual)', 'NRR', 'Observaciones',
    ]);
    const PROB = { 1: 'Nunca', 2: 'Casi nunca', 3: 'Ocasionalmente', 4: 'Casi siempre', 5: 'Siempre' };
    const CONS = { 1: 'Insignificante', 2: 'Leve', 3: 'Moderado', 4: 'Pesado', 5: 'Severo' };
    const CONS_VAL = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
    const nivel = (n) => (n <= 4 ? 'Aceptable' : n <= 12 ? 'Tolerable' : n <= 40 ? 'Alto' : 'Muy Alto');
    riesgos.forEach((rg, i) => {
      const nri = rg.probabilidad ? rg.probabilidad * (CONS_VAL[rg.consecuencia] || 1) : null;
      const nrr = rg.probabilidadResidual ? rg.probabilidadResidual * (CONS_VAL[rg.consecuenciaResidual] || 1) : null;
      estiloFila(ws, 5 + i, [
        i + 1, rg.descripcion, rg.condicionesPropician, rg.consecuenciasIndicador, rg.controlExistente,
        PROB[rg.probabilidad] || '', CONS[rg.consecuencia] || '', nri !== null ? nivel(nri) : '',
        rg.controles, rg.responsableControl,
        PROB[rg.probabilidadResidual] || '', CONS[rg.consecuenciaResidual] || '', nrr !== null ? nivel(nrr) : '',
        rg.observacionesRiesgo,
      ]);
    });
  }

  // ===== MEDIDAS DE SEGURIDAD (reagrupado por categoría) =====
  {
    const ws = wb.addWorksheet('MEDIDAS DE SEGURIDAD');
    ws.columns = [{ width: 5 }, { width: 32 }, { width: 5 }, { width: 32 }, { width: 5 }, { width: 32 }, { width: 35 }];
    estiloTituloHoja(ws, 'MEDIDAS DE SEGURIDAD ASOCIADAS AL TRATAMIENTO DE LA BASE DE DATOS', 7);
    estiloEncabezados(ws, 3, ['ID', 'ADMINISTRATIVAS', 'ID', 'LÓGICAS', 'ID', 'FÍSICAS', 'OBSERVACIONES']);

    const admin = controles.filter((c) => c.tipo === 'Administrativo');
    const logicas = controles.filter((c) => c.tipo === 'Técnico');
    const fisicas = controles.filter((c) => c.tipo === 'Físico');
    const operacionales = controles.filter((c) => c.tipo === 'Operacional');

    const maxFilas = Math.max(admin.length, logicas.length, fisicas.length, 1);
    for (let i = 0; i < maxFilas; i++) {
      const r = 4 + i;
      if (admin[i]) { ws.getCell(r, 1).value = i + 1; ws.getCell(r, 2).value = `${admin[i].descripcion} (${admin[i].estado})`; }
      if (logicas[i]) { ws.getCell(r, 3).value = i + 1; ws.getCell(r, 4).value = `${logicas[i].descripcion} (${logicas[i].estado})`; }
      if (fisicas[i]) { ws.getCell(r, 5).value = i + 1; ws.getCell(r, 6).value = `${fisicas[i].descripcion} (${fisicas[i].estado})`; }
    }
    if (operacionales.length) {
      ws.getCell(4, 7).value = 'Controles operacionales: ' +
        operacionales.map((o) => `${o.descripcion} (${o.estado}${o.responsable ? ', resp. ' + o.responsable : ''})`).join('; ');
      ws.getCell(4, 7).alignment = { wrapText: true, vertical: 'top' };
    }
  }

  // ===== VULNERACIONES =====
  {
    const ws = wb.addWorksheet('VULNERACIONES');
    ws.columns = Array(12).fill({ width: 18 });
    estiloTituloHoja(ws, 'REGISTRO DE VULNERACIONES', 12);
    estiloEncabezados(ws, 3, [
      'Fecha del hallazgo', 'Nombre del incidente', 'Descripción', 'Datos comprometidos',
      'Acciones correctivas', 'Fecha reporte PRODHAB', 'N° de oficio', 'Comunicación a partes',
      'Responsable de seguimiento', 'Informe final de cierre', 'Fecha de cierre', 'Observaciones',
    ]);
    vulneraciones.forEach((v, i) => {
      estiloFila(ws, 4 + i, [
        v.fechaHallazgo, v.nombreIncidente, v.descripcion, v.datosComprometidos,
        v.accionesCorrectivas, v.fechaReporteProdhab, v.numeroOficio, siNo(v.comunicacionPartes),
        v.responsableSeguimiento, siNo(v.informeFinalCierre), v.fechaCierre, v.observaciones,
      ]);
    });
  }

  // ===== PLAN DE ACCION GENERAL =====
  {
    const ws = wb.addWorksheet('PLAN DE ACCION GENERAL');
    ws.columns = [{ width: 5 }, { width: 34 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 22 }, { width: 16 }, { width: 30 }];
    estiloTituloHoja(ws, 'PLAN DE ACCIÓN GENERAL', 8);
    estiloEncabezados(ws, 3, ['N°', 'Listado de actividades', 'Duración', 'Fecha inicio', 'Fecha final', 'Coordinación', 'Estado', 'Observaciones']);
    planAccion.forEach((p, i) => {
      estiloFila(ws, 4 + i, [i + 1, p.actividades, p.duracion, p.fechaInicio, p.fechaFinal, p.coordinacion, p.estado, p.observaciones]);
    });
  }

  // ===== CONTROL DE DOCUMENTOS =====
  {
    const ws = wb.addWorksheet('CONTROL DE DOCUMENTOS');
    ws.columns = [{ width: 34 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 }, { width: 30 }];
    estiloTituloHoja(ws, 'CONTROL DE DOCUMENTOS', 8);
    estiloEncabezados(ws, 3, ['Nombre', 'Se requiere', 'Realizado', 'Revisado', 'Aprobado', 'Versión', 'Actualización', 'Observaciones']);
    controlDocs.forEach((c, i) => {
      estiloFila(ws, 4 + i, [
        c.nombre, siNo(c.seRequiere), siNo(c.realizado), siNo(c.revisado), siNo(c.aprobado),
        c.version, c.actualizacion, c.observaciones,
      ]);
    });
  }

  // ===== Descargar =====
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const nombreArchivo = `Protocolo_${(expediente.entidad || 'PRODHAB').replace(/[^a-zA-Z0-9]/g, '_')}_${expediente.numeroExpediente || expediente.anio || ''}.xlsx`;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}