# 🎯 CONTEXTO PROYECTO PRODHAB - Claude Assistant

## INFORMACIÓN GENERAL

**Proyecto:** Sistema Web de Protocolos de Actuación - PRODHAB
**Supervisor:** MSc. Wendy Rivera Román (rrhh@prodhab.go.cr)
**Institución:** PRODHAB - Costa Rica
**Email TCU:** inavarro40580@ufide.ac.cr
**Ley:** Ley Nº 8968 - Protección de Datos Personales
**Desarrollador:** Isaac Gabriel Navarro Bermúdez (7mo semestre, UFIDELITAS)
**Fecha:** Martes 16 de junio 2026
**Horas usadas hoy:** ~10 horas
**Total TCU:** 27.5 + 10 = 37.5h de 150h

---

## DESCRIPCIÓN DEL SISTEMA

### Propósito
Crear un **wizard web de 8 pasos** para que entidades costarricenses registren sus **protocolos de actuación** en tratamiento de datos personales, cumpliendo con Ley 8968.

### Características
- ✅ 8 pasos secuenciales (wizard)
- ✅ Validaciones en tiempo real
- ✅ Cálculo automático de matriz de riesgos
- ✅ Exportación a Excel (15 hojas)
- ✅ Guardado automático cada 30s
- ✅ 100% cliente (sin backend)
- ✅ Responsive (mobile + desktop)

### Artículos Reglamento Cubiertos
- Art. 27: Procedimientos de tratamiento
- Art. 32: Inventario de bases de datos (subsecciones)
- Art. 34: Evaluación de amenazas
- Art. 35: Factores de riesgo (subsecciones)
- Art. 36: Acciones de seguridad (subsecciones)
- Art. 44 h): Descripción técnica seguridad
- Art. 44 j): Copia protocolos

---

## STACK TECNOLÓGICO

```
Frontend:
  - React 18.3 + Hooks
  - TypeScript
  - Vite 8.0.16
  - Tailwind CSS 3.4.1
  - Framer Motion (animaciones)
  - Lucide React (iconos)
  
Gestión Estado:
  - React Hooks (useState, useEffect, useCallback)
  - Zustand (opcional, preparado)
  - LocalForage (guardado persistente)
  
Validaciones:
  - React Hook Form (preparado)
  - Zod (esquemas)
  
Exportación:
  - ExcelJS 3.4.0
  - 15 hojas Excel con formato PRODHAB
  
Hosting:
  - Vercel (frontend)
  - Railway (testing)
  
Control Versiones:
  - Git + GitHub
  - Commits semánticos
```

---

## ESTRUCTURA DE CARPETAS

```
prodhab-protocolos/
│
├── src/
│   │
│   ├── components/
│   │   ├── Wizard/
│   │   │   ├── WizardContainer.jsx       (Maestro que coordina todo)
│   │   │   ├── StepIndicator.jsx        (Barra progreso animada)
│   │   │   └── NavigationButtons.jsx    (Botones Atrás/Siguiente)
│   │   │
│   │   ├── Forms/
│   │   │   ├── Step1_General.jsx        (Información entidad + BD)
│   │   │   ├── Step2_Inventario.jsx     (Tabla dinámmica BDs)
│   │   │   ├── Step3_Amenazas.jsx       (4 ámbitos × 5 preguntas)
│   │   │   ├── Step4_Finalidad.jsx      (Propósito + datos recopilados)
│   │   │   ├── Step5_Transferencia.jsx  (Transferencias internacionales)
│   │   │   ├── Step6_Riesgos.jsx        (Matriz NRI automática)
│   │   │   ├── Step7_Seguridad.jsx      (Controles técnico/admin/físico)
│   │   │   └── Step8_Revision.jsx       (Preview + descarga Excel)
│   │   │
│   │   ├── Common/
│   │   │   ├── InputField.jsx           (Input reutilizable)
│   │   │   ├── Dropdown.jsx             (Select reutilizable)
│   │   │   ├── FileUpload.jsx           (Upload diagrama ER)
│   │   │   ├── Tooltip.jsx              (Info contextual)
│   │   │   └── ValidationMessage.jsx    (Errores/éxito)
│   │   │
│   │   └── Layout/
│   │       ├── Header.jsx               (Logo + título PRODHAB)
│   │       └── Sidebar.jsx              (Navegación 8 pasos)
│   │
│   ├── hooks/
│   │   ├── useFormData.js               (Gestión estado global formulario)
│   │   ├── useAutoSave.js               (Guardado automático localStorage)
│   │   └── useRiskCalculator.js         (Cálculos matriz riesgos)
│   │
│   ├── utils/
│   │   ├── validators.js                (Validaciones: email, BD, archivos)
│   │   ├── constants.js                 (Constantes: gestores, tipos, colores)
│   │   ├── riskCalculator.js            (Lógica NRI, niveles, resúmenes)
│   │   └── excelGenerator.js            (Generación Excel ExcelJS)
│   │
│   ├── data/
│   │   └── formSchema.json              (Schema formulario)
│   │
│   ├── App.jsx                          (Raíz + React Router)
│   ├── main.jsx                         (Entry point)
│   └── index.css                        (Estilos globales + Tailwind)
│
├── claude.md                            (Este archivo - contexto para IA)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

---

## LOS 8 PASOS DEL WIZARD

### Paso 1: Información General
**Campos:**
- Entidad (text, 3+ chars, obligatorio)
- Año (number, obligatorio)
- Nombre BD (text, 2+ chars, obligatorio)
- Responsable (text, 3+ chars, obligatorio)
- Gestor BD (dropdown: MySQL, PostgreSQL, Oracle, SQL Server, MongoDB, MariaDB, SQLite, obligatorio)
- Versión Gestor (text con regex `\d+\.\d+`, obligatorio)
- Email (email válido, obligatorio)
- Diagrama ER (file: .png/.pdf/.jpg, <5MB, obligatorio)

**Validaciones:** En tiempo real, mensajes de error rojo/verde

---

### Paso 2: Inventario de Bases de Datos
**Tabla dinámica:**
- Nombre BD (obligatorio)
- Descripción (opcional)
- Gestor (dropdown, obligatorio)
- Versión (opcional)
- Ubicación (optional)
- Tipo (dropdown, obligatorio)
- Botón: Agregar BD, Eliminar BD

**Lógica:** Agregar/eliminar filas dinámicamente

---

### Paso 3: Evaluación de Amenazas
**4 Ámbitos × 5 Preguntas cada uno = 20 preguntas:**

1. **Acceso No Autorizado**
   - P1: Controles de acceso basados en roles
   - P2: Registro y monitoreo de accesos
   - P3: Conexiones cifradas (SSL/TLS)
   - P4: Autenticación multifactor
   - P5: Auditoría de permisos

2. **Destrucción de Datos**
   - P1-P5 sobre backups

3. **Alteración de Datos**
   - P1-P5 sobre auditoría e integridad

4. **No Disponibilidad**
   - P1-P5 sobre redundancia y SLA

**Respuestas:** SÍ/NO por pregunta
**Cálculo:** Puntuación por ámbito (0-5)
**Visual:** Matriz probabilidad × consecuencia (5×5 con colores)

---

### Paso 4: Finalidad y Datos Recopilados
**Campos:**
- Finalidad (textarea, obligatorio)
- Base Legal (dropdown, obligatorio)
- Tabla de Datos:
  - Nombre del dato (obligatorio)
  - Tipo (dropdown, obligatorio)
  - Carácter (Obligatorio/Opcional)
- Botón: Agregar Dato

---

### Paso 5: Transferencias Internacionales
**Lógica condicional:**
- Pregunta: ¿Realiza transferencias? SÍ/NO
- Si NO → Ocultar tabla
- Si SÍ → Mostrar tabla:
  - País destino (dropdown, obligatorio)
  - Tipo transferencia (dropdown, obligatorio)
  - Justificación (text)
  - Base legal (text)

---

### Paso 6: Gestión de Riesgos
**Tabla de riesgos con cálculo automático:**
- Descripción (obligatorio)
- Probabilidad (1-5, obligatorio)
- Consecuencia (1-5 → valor 1/2/4/8/16, obligatorio)
- NRI (automático: P × C)
- Nivel (automático: Aceptable/Tolerable/Alto/Muy Alto)

**Matriz visual:** 5×5 con colores (verde/amarillo/naranja/rojo)

**Estadísticas:** 4 cajas mostrando total por nivel

---

### Paso 7: Medidas de Seguridad y Controles
**Tabla de controles:**
- Tipo (Técnico/Administrativo/Físico, obligatorio)
- Descripción (obligatorio)
- Estado (Implementado/Planificado/Parcialmente/No aplicable, obligatorio)
- Responsable (optional)

**Sugerencias:** Lista de 13 controles recomendados (clickear para agregar)

**Estadísticas:** 5 cajas (Total, Técnicos, Admin, Físicos, Implementados)

---

### Paso 8: Revisión y Exportación
**Funcionalidades:**
- Barra completitud (0-100%)
- Resumen de cada paso con datos ingresados
- Botón "Descargar Excel" (VERDE)
- Botón "Descargar PDF" (opcional)
- Info contacto PRODHAB
- Nota de versión

---

## PROBLEMA ACTUAL (16/6/2026 - 14:30h)

### Síntoma
En **Step1_General**, el botón **"Siguiente" permanece DESHABILITADO** aunque todos los campos están rellenados correctamente.

**Screenshot muestra:**
- ✅ Entidad: AdficFd4
- ✅ Año: 2026
- ✅ Nombre BD: beleñefe
- ✅ Responsable: donde widereoftrow
- ✅ Gestor BD: SQL Server
- ✅ Versión: SQL Server 2019 (15.0.2000.5)
- ✅ Email: isaarnermuda12@gmail.com
- ✅ Diagrama ER: seleccionado

**Pero:** Botón sigue GRIS con mensaje "Completa los campos obligatorios"

### Causa Probable
El flujo de datos entre **Step1_General → WizardContainer** está roto:
1. `onChange` en Step1_General NO actualiza correctamente el estado padre
2. `WizardContainer.validateCurrentStep()` no detecta que hay datos
3. `stepValidation[1]` permanece `false`
4. `NavigationButtons` recibe `isValid={false}` → botón deshabilitado

### Archivos Involucrados
```
WizardContainer.jsx
  ├── Recibe: (currentStep, setCurrentStep, formData, setFormData)
  ├── Pasa a Step1: (data={...}, onChange={handleStepDataChange})
  └── Valida: validateCurrentStep() → setStepValidation
     
Step1_General.jsx
  ├── Recibe: (data, onChange)
  ├── Llama: onChange(formData) en useEffect
  └── Problem: ¿onChange no dispara? ¿formData está vacío?

NavigationButtons.jsx
  ├── Recibe: isValid prop
  └── Renderiza: className con bg-blue-600 o bg-gray-400
```

---

## REGLAS DE DESARROLLO

### Validaciones
✅ Tiempo real (no al submit)
✅ Mensajes claros rojo/verde
✅ Campos requeridos marcados con *
✅ Tooltips (?) con explicaciones

### UX
✅ Animaciones suaves (Framer Motion)
✅ Feedback visual claro
✅ Barra progreso siempre visible
✅ Sidebar activa paso actual
✅ Botón Atrás solo si no es paso 1

### Código
✅ TypeScript con tipos explícitos
✅ Componentes puros (sin side effects)
✅ Hooks reutilizables
✅ Utils sin React
✅ Comentarios en español
✅ Nombres descriptivos (camelCase)

### Testing
✅ Cargar navegador y probar cada paso
✅ Validar que botón se habilita/deshabilita
✅ Probar guardado automático (F12 → Application → localStorage)
✅ Probar descarga Excel (Step8)

---

## PRÓXIMOS PASOS DESPUÉS DE ARREGLAR STEP1

1. ✅ Arreglar validación Step1 (Hoy)
2. ⏳ Testear Steps 2-8 (mañana)
3. ⏳ Implementar descarga Excel (excelGenerator.js)
4. ⏳ Agregar colores PRODHAB (brand colors)
5. ⏳ Dark mode
6. ⏳ Testing exhaustivo
7. ⏳ Documentación PDF

---

## INFORMACIÓN IMPORTANTE

### Horas TCU
- Semana 1-2: 20h (análisis)
- Semana 3 (5/6): 7.5h (setup)
- Semana 3 (6/6): 6h (setup)
- Semana 4 (14/6): 8h (pasos 2-8)
- Hoy (16/6): 10h (hooks, utils, componentes)
- **TOTAL: 51.5h de 150h (34.3%)**

### Supervisor PRODHAB
- MSc. Wendy Rivera Román
- Email: rrhh@prodhab.go.cr
- Teléfono: 2234-0189 ext 115
- Reunión: 27/5 (realizada)

### Reglamento
Todo debe cumplir **Ley Nº 8968** específicamente:
- Artículos 27, 32, 34-36, 44

---

## INSTRUCCIONES PARA CLAUDE (IA ASSISTANT)

### Cuando leas este archivo, debes:

1. **ENTENDER:**
   - Qué es PRODHAB (institución costarricense)
   - Ley 8968 (regulación de datos personales)
   - El wizard tiene 8 pasos específicos
   - Es 100% frontend (React + Vite + Tailwind)

2. **DIAGNOSTICAR:**
   - El problema es el flujo de datos en Step1
   - El botón "Siguiente" NO se habilita
   - Los campos SÍ están llenos en UI
   - La validación falla silenciosamente

3. **INVESTIGAR:**
   - Revisar `WizardContainer.handleStepDataChange()`
   - Revisar `Step1_General.onChange(formData)`
   - Revisar `NavigationButtons.isValid` prop
   - Buscar logs/errores en console (F12)

4. **PROPONER SOLUCIONES:**
   - Código exacto a copiar/pegar
   - Explicar QUÉ estaba mal
   - Cómo testear que funciona
   - Qué agregar para debugging

5. **MANTENER CONSISTENCIA:**
   - Mismo patrón para todos los pasos
   - Validaciones en tiempo real
   - Animaciones con Framer Motion
   - Estilos con Tailwind
   - Comentarios en español

### Responde en este formato:

```
## 🔍 DIAGNOSIS
[Qué está mal]

## ✅ SOLUCIÓN
[Código corregido]

## 📝 EXPLICACIÓN
[Por qué esto arregla el problema]

## 🧪 CÓMO TESTEAR
[Pasos para verificar que funciona]

## 💡 BONUS
[Mejoras opcionales]
```

