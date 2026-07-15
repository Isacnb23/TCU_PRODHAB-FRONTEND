/**
 * InfoBanner.jsx - Banner informativo de cabecera de cada paso
 *
 * Estilo institucional:
 * - Fondo degradado azul muy claro → blanco
 * - Borde izquierdo azul marino (4px)
 * - Ícono del paso a la izquierda, título en azul marino, descripción en gris
 *
 * Props:
 * - Icon: componente de ícono (lucide-react) del paso actual
 * - title: título del paso (azul marino, semibold)
 * - description: texto descriptivo (opcional)
 * - children: contenido adicional (opcional)
 */
export default function InfoBanner({ Icon, title, description, children }) {
  return (
    <div className="flex gap-3 rounded-r-xl bg-gradient-to-r from-[#EFF6FF] to-white border-l-4 border-[#1B2A4A] p-4">
      {Icon && (
        <Icon size={20} className="text-[#1B2A4A] flex-shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        {title && (
          <p className="font-semibold text-[#1B2A4A]">{title}</p>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
