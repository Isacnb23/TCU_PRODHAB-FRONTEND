import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InputField from '../Common/InputField';
import Dropdown from '../Common/Dropdown';
import FileUpload from '../Common/FileUpload';
import Tooltip from '../Common/Tooltip';

/**
 * Step1_General.jsx - Paso 1: Información General
 * 
 * Campos incluidos:
 * - Entidad (obligatorio)
 * - Nombre Base de Datos (obligatorio)
 * - Gestor BD: MySQL, PostgreSQL, Oracle, SQL Server (obligatorio)
 * - Versión Gestor BD (obligatorio - validación estricta)
 * - Diagrama Entidad-Relación (obligatorio - archivo)
 * - Año (obligatorio)
 * - Responsable (obligatorio)
 * - Contacto (email, obligatorio)
 * 
 * Artículos del Reglamento: Art. 27, 44 h)
 */

const GESTORES_BD = [
  'MySQL',
  'PostgreSQL',
  'Oracle',
  'SQL Server',
  'MongoDB',
  'MariaDB',
  'Otro',
];

export default function Step1_General({ data = {}, onChange }) {
  const [formData, setFormData] = useState({
    entidad: data.entidad || '',
    nombreBD: data.nombreBD || '',
    gestorBD: data.gestorBD || '',
    versionBD: data.versionBD || '',
    diagramaER: data.diagramaER || null,
    ano: data.ano || new Date().getFullYear(),
    responsable: data.responsable || '',
    contacto: data.contacto || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Sincroniza cambios con el componente padre
   */
  useEffect(() => {
    onChange(formData);
  }, [formData]);

  /**
   * Valida un campo específico
   */
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'entidad':
        if (!value.trim()) {
          newErrors.entidad = 'La entidad es obligatoria';
        } else if (value.length < 3) {
          newErrors.entidad = 'Mínimo 3 caracteres';
        } else {
          delete newErrors.entidad;
        }
        break;

      case 'nombreBD':
        if (!value.trim()) {
          newErrors.nombreBD = 'El nombre de la BD es obligatorio';
        } else if (value.length < 2) {
          newErrors.nombreBD = 'Mínimo 2 caracteres';
        } else {
          delete newErrors.nombreBD;
        }
        break;

      case 'gestorBD':
        if (!value) {
          newErrors.gestorBD = 'Selecciona un gestor de BD';
        } else {
          delete newErrors.gestorBD;
        }
        break;

      case 'versionBD':
        if (!value.trim()) {
          newErrors.versionBD = 'La versión es obligatoria';
        } else if (!/\d+\.\d+/.test(value)) {
          newErrors.versionBD =
            'Versión inválida. Ejemplo: SQL Server 2019 (15.0.2000.5)';
        } else {
          delete newErrors.versionBD;
        }
        break;

      case 'contacto':
        if (!value.trim()) {
          newErrors.contacto = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.contacto = 'Email inválido';
        } else {
          delete newErrors.contacto;
        }
        break;

      case 'responsable':
        if (!value.trim()) {
          newErrors.responsable = 'El responsable es obligatorio';
        } else if (value.length < 3) {
          newErrors.responsable = 'Mínimo 3 caracteres';
        } else {
          delete newErrors.responsable;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  /**
   * Maneja cambios en inputs de texto
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  /**
   * Maneja cambios en dropdowns
   */
  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  /**
   * Maneja upload de archivo (diagrama ER)
   */
  const handleFileUpload = (file) => {
    if (file) {
      // Validar formato
      const formatos = ['.png', '.pdf', '.jpg', '.jpeg'];
      const esValido = formatos.some((f) => file.name.toLowerCase().endsWith(f));

      if (!esValido) {
        setErrors((prev) => ({
          ...prev,
          diagramaER: 'Formato inválido. Usa: PNG, PDF o JPG',
        }));
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          diagramaER: 'El archivo es muy grande (máx 5MB)',
        }));
        return;
      }

      // Guardar archivo
      setFormData((prev) => ({
        ...prev,
        diagramaER: file,
      }));

      delete errors.diagramaER;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción del paso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📋 <strong>Paso 1: Información General</strong>
          <br />
          Completa los datos básicos de tu base de datos y entidad.
        </p>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entidad <span className="text-red-500">*</span>
            <Tooltip text="Nombre de la institución o empresa responsable de la base de datos. Ej: CCSS, CAJA, MINAE" />
          </label>
          <input
            type="text"
            name="entidad"
            value={formData.entidad}
            onChange={handleInputChange}
            onBlur={() => setTouched((prev) => ({ ...prev, entidad: true }))}
            placeholder="Ej: CCSS, MINAE, Empresa XYZ"
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.entidad && touched.entidad
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.entidad && touched.entidad && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.entidad}</p>
          )}
        </div>

        {/* Año */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año <span className="text-red-500">*</span>
            <Tooltip text="Año en que se registra el protocolo de actuación" />
          </label>
          <input
            type="number"
            name="ano"
            value={formData.ano}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Nombre Base de Datos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Base de Datos <span className="text-red-500">*</span>
            <Tooltip text="Nombre específico de la base de datos. Ej: Pacientes, Estudiantes, Empleados" />
          </label>
          <input
            type="text"
            name="nombreBD"
            value={formData.nombreBD}
            onChange={handleInputChange}
            onBlur={() => setTouched((prev) => ({ ...prev, nombreBD: true }))}
            placeholder="Ej: Pacientes, Usuarios"
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.nombreBD && touched.nombreBD
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.nombreBD && touched.nombreBD && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.nombreBD}</p>
          )}
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Responsable <span className="text-red-500">*</span>
            <Tooltip text="Nombre completo de la persona responsable de la base de datos" />
          </label>
          <input
            type="text"
            name="responsable"
            value={formData.responsable}
            onChange={handleInputChange}
            onBlur={() => setTouched((prev) => ({ ...prev, responsable: true }))}
            placeholder="Ej: Juan Pérez González"
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.responsable && touched.responsable
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.responsable && touched.responsable && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.responsable}</p>
          )}
        </div>

        {/* Gestor BD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gestor de Base de Datos <span className="text-red-500">*</span>
            <Tooltip text="Selecciona el software de BD que utilizas" />
          </label>
          <select
            value={formData.gestorBD}
            onChange={(e) =>
              handleDropdownChange('gestorBD', e.target.value)
            }
            onBlur={() => setTouched((prev) => ({ ...prev, gestorBD: true }))}
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.gestorBD && touched.gestorBD
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          >
            <option value="">-- Selecciona --</option>
            {GESTORES_BD.map((gestor) => (
              <option key={gestor} value={gestor}>
                {gestor}
              </option>
            ))}
          </select>
          {errors.gestorBD && touched.gestorBD && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.gestorBD}</p>
          )}
        </div>

        {/* Versión BD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Versión del Gestor <span className="text-red-500">*</span>
            <Tooltip text="Versión completa. Ej: SQL Server 2019 (15.0.2000.5) o MySQL 8.0.32" />
          </label>
          <input
            type="text"
            name="versionBD"
            value={formData.versionBD}
            onChange={handleInputChange}
            onBlur={() => setTouched((prev) => ({ ...prev, versionBD: true }))}
            placeholder="Ej: SQL Server 2019 (15.0.2000.5)"
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.versionBD && touched.versionBD
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.versionBD && touched.versionBD && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.versionBD}</p>
          )}
        </div>

        {/* Contacto (Email) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Contacto <span className="text-red-500">*</span>
            <Tooltip text="Email del responsable o persona de contacto" />
          </label>
          <input
            type="email"
            name="contacto"
            value={formData.contacto}
            onChange={handleInputChange}
            onBlur={() => setTouched((prev) => ({ ...prev, contacto: true }))}
            placeholder="Ej: juan@ccss.go.cr"
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.contacto && touched.contacto
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.contacto && touched.contacto && (
            <p className="text-red-500 text-sm mt-1">⚠️ {errors.contacto}</p>
          )}
        </div>
      </div>

      {/* Diagrama ER (ancho completo) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagrama Entidad-Relación <span className="text-red-500">*</span>
          <Tooltip text="Archivo que muestra la estructura de tu base de datos (PNG, PDF o JPG). Máx 5MB. REQUERIDO por PRODHAB" />
        </label>
        <FileUpload
          onUpload={handleFileUpload}
          accept=".png,.pdf,.jpg,.jpeg"
          label="Selecciona diagrama ER"
          fileName={formData.diagramaER?.name}
        />
        {errors.diagramaER && (
          <p className="text-red-500 text-sm mt-1">⚠️ {errors.diagramaER}</p>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          📋 RESUMEN DEL PASO
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Entidad: {formData.entidad || 'No ingresada'}</li>
          <li>✓ Base de Datos: {formData.nombreBD || 'No ingresada'}</li>
          <li>
            ✓ Gestor BD: {formData.gestorBD || 'No seleccionado'} v
            {formData.versionBD || '?'}
          </li>
          <li>
            ✓ Diagrama ER:{' '}
            {formData.diagramaER
              ? `${formData.diagramaER.name} ✅`
              : 'No cargado'}
          </li>
        </ul>
      </div>
    </motion.div>
  );
}