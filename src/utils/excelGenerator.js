import ExcelJS from 'exceljs';

/**
 * excelGenerator.js - Generación de archivos Excel
 * 
 * Nota: Esta es una versión simplificada
 * La versión completa con 15 hojas se implementará en siguiente fase
 */

/**
 * Generar Excel básico
 */
export const generarExcelBasico = async (datosFormulario) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Información General
    const sheetGeneral = workbook.addWorksheet('General');
    sheetGeneral.columns = [
      { header: 'Campo', key: 'campo', width: 30 },
      { header: 'Valor', key: 'valor', width: 40 },
    ];

    // Llenar datos
    const datosStep1 = datosFormulario.step1_general || {};
    Object.entries(datosStep1).forEach(([key, value]) => {
      sheetGeneral.addRow({
        campo: key,
        valor: value,
      });
    });

    // Hoja 2: Inventario
    const sheetInventario = workbook.addWorksheet('Inventario');
    sheetInventario.columns = [
      { header: 'Nombre BD', key: 'nombre', width: 20 },
      { header: 'Gestor', key: 'gestor', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 15 },
    ];

    const datosStep2 = datosFormulario.step2_inventario || {};
    const bases = datosStep2.bases || [];
    bases.forEach((bd) => {
      sheetInventario.addRow({
        nombre: bd.nombre,
        gestor: bd.gestor,
        tipo: bd.tipo,
      });
    });

    // Hoja 3: Riesgos
    const sheetRiesgos = workbook.addWorksheet('Riesgos');
    sheetRiesgos.columns = [
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Probabilidad', key: 'probabilidad', width: 12 },
      { header: 'Consecuencia', key: 'consecuencia', width: 12 },
      { header: 'NRI', key: 'nri', width: 8 },
    ];

    const datosStep6 = datosFormulario.step6_riesgos || {};
    const riesgos = datosStep6.riesgos || [];
    riesgos.forEach((r) => {
      const nri = r.probabilidad * r.consecuencia;
      sheetRiesgos.addRow({
        descripcion: r.descripcion,
        probabilidad: r.probabilidad,
        consecuencia: r.consecuencia,
        nri: nri,
      });
    });

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Protocolo_PRODHAB_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generando Excel:', error);
    throw error;
  }
};