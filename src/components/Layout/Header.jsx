/**
 * Header.jsx - Encabezado global de la aplicación
 * 
 * Responsabilidades:
 * - Logo y nombre de la aplicación
 * - Información del proyecto
 * - Navegación principal (si la hay)
 */

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Contenedor flex para logo + info */}
        <div className="flex items-center justify-between">
          {/* Logo + Titulo */}
          <div className="flex items-center gap-4">
            {/* Logo (placeholder) */}
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PD</span>
            </div>

            {/* Información */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PRODHAB
              </h1>
              <p className="text-sm text-gray-600">
                Sistema Web de Protocolos de Actuación
              </p>
            </div>
          </div>

          {/* Info proyecto */}
          <div className="text-right">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Ley 8968</span> - Protección de Datos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              v1.0.0 | 2026
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}