import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InputField from '../Common/InputField';
import Dropdown from '../Common/Dropdown';
import FileUpload from '../Common/FileUpload';
import Tooltip from '../Common/Tooltip';
import InfoBanner from '../Common/InfoBanner';
import StepSummary from '../Common/StepSummary';
import OptionalSection from '../Common/OptionalSection';
import { Building2, AlertCircle } from 'lucide-react';

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

/**
 * Versiones sugeridas por gestor de BD.
 * La opción "Otra..." habilita un campo de texto libre.
 */
const VERSIONES_BD = {
  MySQL: ['9.1.0', '9.0.1', '8.4.3', '8.0.40', '5.7.44', 'Otra...'],
  PostgreSQL: ['17.2', '16.6', '15.10', '14.15', '13.18', 'Otra...'],
  'SQL Server': [
    'SQL Server 2022 (16.0)',
    'SQL Server 2019 (15.0)',
    'SQL Server 2017 (14.0)',
    'SQL Server 2016 (13.0)',
    'Otra...',
  ],
  Oracle: [
    'Oracle 23c (23.0)',
    'Oracle 21c (21.0)',
    'Oracle 19c (19.0)',
    'Oracle 12c (12.2)',
    'Otra...',
  ],
  MongoDB: ['8.0', '7.0', '6.0', '5.0', 'Otra...'],
  MariaDB: ['11.6', '11.4', '10.11', '10.6', 'Otra...'],
  SQLite: ['3.47', '3.45', '3.43', '3.40', 'Otra...'],
  Otro: ['Otra...'],
};

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
    // Campos opcionales (sheet GENERAL del Excel)
    area: data.area || '',
    cantidadLicencias: data.cantidadLicencias || '',
    cantidadUsuarios: data.cantidadUsuarios || '',
    alojamiento: data.alojamiento || '',
    acceso: data.acceso || '',
    mecanismoDerechos: data.mecanismoDerechos || '',
    fechaCreacion: data.fechaCreacion || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Selección del dropdown de versión (dependiente del gestor).
  // Vale "Otra..." cuando el usuario escribe una versión personalizada.
  const [versionSelect, setVersionSelect] = useState(() => {
    if (!data.versionBD) return '';
    const opts = VERSIONES_BD[data.gestorBD] || [];
    return opts.includes(data.versionBD) ? data.versionBD : 'Otra...';
  });

  /**
   * Sincroniza cambios con el componente padre
   */
  useEffect(() => {
    const isValid = !!(
      formData.entidad?.trim().length >= 3 &&
      formData.nombreBD?.trim().length >= 2 &&
      formData.gestorBD &&
      formData.versionBD?.trim() &&
      /\d+\.\d+/.test(formData.versionBD) &&
      formData.responsable?.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto) &&
      formData.diagramaER
    );
    onChange(formData, isValid);
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
   * Cambia el gestor de BD y resetea la versión seleccionada.
   */
  const handleGestorChange = (value) => {
    setFormData((prev) => ({ ...prev, gestorBD: value, versionBD: '' }));
    setVersionSelect('');
    validateField('gestorBD', value);
    validateField('versionBD', '');
  };

  /**
   * Maneja la selección de versión desde el dropdown dependiente.
   * Si elige "Otra..." se limpia el valor para que lo escriba a mano.
   */
  const handleVersionSelect = (value) => {
    setVersionSelect(value);
    const nuevaVersion = value === 'Otra...' ? '' : value;
    setFormData((prev) => ({ ...prev, versionBD: nuevaVersion }));
    validateField('versionBD', nuevaVersion);
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
      <InfoBanner
        Icon={Building2}
        title="Paso 1: Información General"
        description="Completa los datos básicos de tu base de datos y entidad."
      />

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
                  : 'border-gray-300 focus:ring-primary-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.entidad && touched.entidad && (
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.entidad}</p>
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
                  : 'border-gray-300 focus:ring-primary-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.nombreBD && touched.nombreBD && (
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.nombreBD}</p>
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
                  : 'border-gray-300 focus:ring-primary-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.responsable && touched.responsable && (
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.responsable}</p>
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
            onChange={(e) => handleGestorChange(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, gestorBD: true }))}
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.gestorBD && touched.gestorBD
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
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
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.gestorBD}</p>
          )}
        </div>

        {/* Versión BD (dropdown dependiente del gestor) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Versión del Gestor <span className="text-red-500">*</span>
            <Tooltip text="Selecciona la versión según el gestor elegido. Usa 'Otra...' para escribir una versión no listada." />
          </label>
          <select
            value={versionSelect}
            onChange={(e) => handleVersionSelect(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, versionBD: true }))}
            disabled={!formData.gestorBD}
            className={`
              w-full px-4 py-2 rounded-lg border transition-all
              ${
                errors.versionBD && touched.versionBD
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }
              focus:ring-2 focus:outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `}
          >
            <option value="">
              {formData.gestorBD
                ? '-- Selecciona versión --'
                : '-- Primero elige el gestor --'}
            </option>
            {(VERSIONES_BD[formData.gestorBD] || []).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Campo de texto libre cuando el usuario elige "Otra..." */}
          {versionSelect === 'Otra...' && (
            <input
              type="text"
              name="versionBD"
              value={formData.versionBD}
              onChange={handleInputChange}
              onBlur={() => setTouched((prev) => ({ ...prev, versionBD: true }))}
              placeholder="Especifica la versión..."
              className={`
                mt-2 w-full px-4 py-2 rounded-lg border transition-all
                ${
                  errors.versionBD && touched.versionBD
                    ? 'border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }
                focus:ring-2 focus:outline-none
              `}
            />
          )}

          {errors.versionBD && touched.versionBD && formData.gestorBD && (
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.versionBD}</p>
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
                  : 'border-gray-300 focus:ring-primary-500'
              }
              focus:ring-2 focus:outline-none
            `}
          />
          {errors.contacto && touched.contacto && (
            <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.contacto}</p>
          )}
        </div>
      </div>

      {/* Sección opcional */}
      <OptionalSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
              <Tooltip text="Área o departamento responsable de la base de datos" />
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="Ej: TI, Recursos Humanos"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Fecha de creación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de creación de la BD
              <Tooltip text="Fecha en que se creó o comenzó a operar la base de datos" />
            </label>
            <input
              type="date"
              name="fechaCreacion"
              value={formData.fechaCreacion}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Cantidad de licencias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de licencias
              <Tooltip text="Número de licencias del gestor de BD" />
            </label>
            <input
              type="number"
              name="cantidadLicencias"
              value={formData.cantidadLicencias}
              onChange={handleInputChange}
              min="0"
              placeholder="Ej: 5"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Cantidad de usuarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de usuarios
              <Tooltip text="Número de usuarios con acceso a la base de datos" />
            </label>
            <input
              type="number"
              name="cantidadUsuarios"
              value={formData.cantidadUsuarios}
              onChange={handleInputChange}
              min="0"
              placeholder="Ej: 20"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Alojamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alojamiento
              <Tooltip text="Dónde está alojada físicamente la base de datos" />
            </label>
            <select
              name="alojamiento"
              value={formData.alojamiento}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">-- Selecciona --</option>
              <option value="local">Local</option>
              <option value="nube">Nube</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          {/* Acceso / Derechos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acceso / Derechos de acceso
              <Tooltip text="Describe quiénes tienen acceso y qué tipo de permisos" />
            </label>
            <input
              type="text"
              name="acceso"
              value={formData.acceso}
              onChange={handleInputChange}
              placeholder="Ej: Solo personal autorizado de TI"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Mecanismo para ejercicio de derechos */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mecanismo para ejercicio de derechos
              <Tooltip text="Cómo pueden los titulares ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)" />
            </label>
            <input
              type="text"
              name="mecanismoDerechos"
              value={formData.mecanismoDerechos}
              onChange={handleInputChange}
              placeholder="Ej: Formulario en línea / Solicitud escrita al responsable"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
      </OptionalSection>

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
          <p className="text-red-500 text-sm mt-1"><AlertCircle className="w-4 h-4 text-amber-500 inline mr-1" />{errors.diagramaER}</p>
        )}
      </div>

      {/* Resumen */}
      <StepSummary
        items={[
          `Entidad: ${formData.entidad || 'No ingresada'}`,
          `Base de Datos: ${formData.nombreBD || 'No ingresada'}`,
          `Gestor BD: ${formData.gestorBD || 'No seleccionado'} v${formData.versionBD || '?'}`,
          `Diagrama ER: ${
            formData.diagramaER ? `${formData.diagramaER.name} ✅` : 'No cargado'
          }`,
        ]}
      />
    </motion.div>
  );
}