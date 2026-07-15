/**
 * Header.jsx - Encabezado global de la aplicación
 *
 * Responsabilidades:
 * - Logo institucional PRODHAB (versión blanca sobre fondo navy)
 * - Identificación del proyecto (Ley 8968)
 */

// Logo oficial PRODHAB en blanco (PNG transparente, resuelto por Vite)
import logoProdhab from '../../assets/logos/Logo_Prodhab_Blanco_PNG.png';

export default function Header() {
  return (
    <header
      className="h-16 flex-shrink-0 border-b-2 border-[#C9A84C]"
      style={{ background: 'linear-gradient(to right, #1B2A4A, #243761)' }}
    >
      <div className="h-full max-w-full mx-auto px-6 flex items-center justify-between">
        {/* Logo + nombre (sin caja de fondo) */}
        <div className="flex items-center gap-3">
          <img
            src={logoProdhab}
            alt="PRODHAB - Agencia de Protección de Datos de los Habitantes"
            className="h-8 w-auto"
          />
          <div className="leading-tight">
            <p className="text-xl font-bold text-white">PRODHAB</p>
            <p className="text-xs text-white/60">
              Sistema Web de Protocolos de Actuación
            </p>
          </div>
        </div>

        {/* Badge Ley 8968 */}
        <span className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1 rounded-full">
          Ley 8968
        </span>
      </div>
    </header>
  );
}
