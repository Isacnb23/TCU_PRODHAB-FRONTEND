/**
 * Tooltip.jsx - Información contextual
 */

export default function Tooltip({ text, children = '?' }) {
  return (
    <div className="relative inline-block ml-2 group cursor-help">
      <span className="text-blue-600 font-bold hover:text-blue-800">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {text}
      </div>
    </div>
  );
}