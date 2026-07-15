/**
 * InputField.jsx - Campo de entrada reutilizable
 *
 * Estados visuales:
 * - Normal: borde gris (#e5e7eb / gray-200)
 * - Con valor válido: borde dorado (#C9A84C/60)
 * - Con error: borde rojo + ring rojo suave
 * - Foco: ring azul marino suave (#1B2A4A/20)
 */

export default function InputField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  touched,
  required = false,
}) {
  const hasError = error && touched;
  const isFilled = value !== undefined && value !== null && String(value).length > 0;

  // Selección del borde según el estado del campo
  const borderClass = hasError
    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
    : isFilled
    ? 'border-[#C9A84C]/60 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]'
    : 'border-gray-200 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]';

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#C9A84C] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border transition-all
          placeholder:text-[#9ca3af] focus:ring-2 focus:outline-none ${borderClass}`}
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
      )}
    </div>
  );
}
