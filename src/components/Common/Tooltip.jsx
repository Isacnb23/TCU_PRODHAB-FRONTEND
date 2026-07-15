/**
 * Tooltip.jsx - Información contextual
 */

import { HelpCircle } from 'lucide-react';

export default function Tooltip({ text }) {
  return (
    <div className="relative inline-block ml-1.5 align-middle group cursor-help">
      <HelpCircle size={14} className="text-[#1B2A4A]/40 hover:text-[#1B2A4A]/70" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
}
