import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  onImageChange: (dataUrl: string | undefined) => void;
  currentImage?: string;
  required?: boolean;
  helperText?: string;
}

export function ImageUpload({ label = 'Upload Image', onImageChange, currentImage, required = false, helperText }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onImageChange(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <img src={preview} alt="Preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 transition-colors hover:border-orange-400 hover:bg-orange-50/30"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
          <p className="mt-0.5 text-xs text-gray-400">PNG, JPG up to 5 MB</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}
