/**
 * OptionalSection.jsx - Sección de campos opcionales con título divisor
 *
 * Estilo institucional:
 * - Título centrado en gris (#6b7280) con una línea (hr) a cada lado
 * - Los campos opcionales van dentro (children), sin asterisco
 *
 * Props:
 * - title: texto del divisor (por defecto "Información Adicional (opcional)")
 * - children: campos opcionales
 */
export default function OptionalSection({
  title = 'Información Adicional (opcional)',
  children,
}) {
  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest bg-white px-2 whitespace-nowrap">
          {title}
        </span>
        <span className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
      </div>
      {children}
    </div>
  );
}
