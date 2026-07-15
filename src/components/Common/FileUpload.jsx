import { Upload } from 'lucide-react';

/**
 * FileUpload.jsx - Carga de archivos
 */

export default function FileUpload({
  onUpload,
  accept,
  label,
  fileName,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {fileName || 'Haz clic para seleccionar archivo'}
          </p>
          {fileName && (
            <p className="text-xs text-green-600 mt-2">✅ {fileName}</p>
          )}
        </label>
      </div>
    </div>
  );
}