/**
 * Dropdown.jsx - Selector reutilizable
 */

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  error,
  touched,
  name,
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border transition-all ${
          error && touched
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300'
        } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
      >
        <option value="">-- Selecciona --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && touched && (
        <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
      )}
    </div>
  );
}