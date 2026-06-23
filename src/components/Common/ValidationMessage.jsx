/**
 * ValidationMessage.jsx - Mensajes de validación
 */

export default function ValidationMessage({ type = 'error', message }) {
  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm ${
        type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-green-50 text-green-700 border border-green-200'
      }`}
    >
      {type === 'error' ? '❌' : '✅'} {message}
    </div>
  );
}