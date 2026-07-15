/**
 * StepSummary.jsx - Card "Resumen del Paso"
 *
 * Estilo institucional (verde):
 * - Fondo #F0FDF4, borde #86efac, borde izquierdo verde (#16a34a)
 * - Título "✓ Resumen del Paso" en verde
 * - Cada item con checkmark verde
 *
 * Props:
 * - title: título (por defecto "Resumen del Paso")
 * - items: array de strings o nodos a listar
 * - children: contenido adicional (opcional)
 */
export default function StepSummary({ title = 'Resumen del Paso', items = [], children }) {
  return (
    <div className="rounded-lg bg-[#F0FDF4] border border-[#86efac] border-l-4 border-l-[#16a34a] p-4">
      <p className="font-semibold text-[#15803d] mb-2">✓ {title}</p>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-[#166534]">
              <span className="text-[#16a34a]">✓</span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
