import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Step8_Revision.jsx - Paso 8: Revisión y Exportación
 * 
 * Funcionalidades:
 * - Preview de todos los datos ingresados
 * - Validación final
 * - Botón descargar Excel
 * - Información de contacto
 * 
 * Artículos del Reglamento: Art. 44 j)
 */

export default function Step8_Revision({ data = {}, onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [completitud, setCompletitud] = useState(0);

  /**
   * Calcular completitud del formulario
   */
  useEffect(() => {
    const totalCampos = 8; // 8 pasos
    let rellenos = 0;

    if (data.step1_general && Object.keys(data.step1_general).length > 0) rellenos++;
    if (data.step2_inventario && Object.keys(data.step2_inventario).length > 0) rellenos++;
    if (data.step3_amenazas && Object.keys(data.step3_amenazas).length > 0) rellenos++;
    if (data.step4_finalidad && Object.keys(data.step4_finalidad).length > 0) rellenos++;
    if (data.step5_transferencia && Object.keys(data.step5_transferencia).length > 0) rellenos++;
    if (data.step6_riesgos && Object.keys(data.step6_riesgos).length > 0) rellenos++;
    if (data.step7_seguridad && Object.keys(data.step7_seguridad).length > 0) rellenos++;
    
    setCompletitud(Math.round((rellenos / totalCampos) * 100));
  }, [data]);

  /**
   * Descargar Excel
   */
  const descargarExcel = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implementar generación de Excel con ExcelJS
      // Por ahora, simular descarga
      
      // Simular procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      alert('✅ Excel descargado exitosamente!\n\nNota: La generación real de Excel se implementará en el siguiente paso.');
      
    } catch (error) {
      alert('❌ Error al descargar: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ✅ <strong>Paso 8: Revisión y Exportación</strong>
          <br />
          Revisa toda la información ingresada y descarga tu protocolo en
          formato Excel.
        </p>
      </div>

      {/* Barra de completitud */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">
            Completitud del Formulario
          </span>
          <span className="text-lg font-bold text-blue-600">
            {completitud}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            animate={{ width: `${completitud}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-500 to-blue-600"
          />
        </div>
      </div>

      {/* Resumen de datos por paso */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">
          📋 Resumen de Pasos
        </p>

        {/* Paso 1 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 1: Información General</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step1_general?.entidad || 'Sin datos'}
            </p>
          </div>
        </motion.div>

        {/* Paso 2 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 2: Inventario</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step2_inventario?.bases?.length || 0} bases de datos registradas
            </p>
          </div>
        </motion.div>

        {/* Paso 3 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 3: Evaluación de Amenazas</p>
            <p className="text-xs text-gray-600 mt-1">
              4 ámbitos evaluados
            </p>
          </div>
        </motion.div>

        {/* Paso 4 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 4: Finalidad y Datos</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step4_finalidad?.datosRecopilados?.length || 0} datos recopilados
            </p>
          </div>
        </motion.div>

        {/* Paso 5 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 5: Transferencias</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step5_transferencia?.realizaTransferencias ? 'Sí' : 'No'} realiza transferencias
            </p>
          </div>
        </motion.div>

        {/* Paso 6 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 6: Gestión de Riesgos</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step6_riesgos?.riesgos?.length || 0} riesgos identificados
            </p>
          </div>
        </motion.div>

        {/* Paso 7 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Paso 7: Medidas de Seguridad</p>
            <p className="text-xs text-gray-600 mt-1">
              {data.step7_seguridad?.controles?.length || 0} controles implementados
            </p>
          </div>
        </motion.div>
      </div>

      {/* Información importante */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Antes de descargar:</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>✓ Verifica que todos los campos obligatorios estén completos</li>
            <li>✓ Revisa la información ingresada</li>
            <li>✓ Asegúrate de tener permisos para descarga</li>
            <li>✓ El archivo será en formato Excel (.xlsx)</li>
          </ul>
        </div>
      </div>

      {/* Botón descargar Excel */}
      <motion.div
        className="flex gap-4"
      >
        <motion.button
          whileHover={!isGenerating ? { scale: 1.05 } : {}}
          whileTap={!isGenerating ? { scale: 0.95 } : {}}
          onClick={descargarExcel}
          disabled={isGenerating || completitud < 50}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
            isGenerating || completitud < 50
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Generando Excel...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Protocolo (Excel)
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
        >
          📄 PDF
        </motion.button>
      </motion.div>

      {/* Información de contacto PRODHAB */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">
          📞 Soporte PRODHAB
        </p>
        <p className="text-xs text-blue-800 mb-1">
          <strong>Supervisora:</strong> MSc. Wendy Rivera Román
        </p>
        <p className="text-xs text-blue-800">
          <strong>Email:</strong> rrhh@prodhab.go.cr | <strong>Teléfono:</strong> 2234-0189 ext 115
        </p>
      </div>

      {/* Nota final */}
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-700">
          📋 <strong>Sistema Web de Protocolos de Actuación - PRODHAB</strong>
          <br />
          Ley Nº 8968 - Protección de Datos Personales
          <br />
          <span className="text-gray-500">v1.0.0 | 2026</span>
        </p>
      </div>
    </motion.div>
  );
}