/**
 * InputField.jsx - Campo de entrada reutilizable
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
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border transition-all ${
          error && touched
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300'
        } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
      />
      {error && touched && (
        <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
      )}
    </div>
  );
}