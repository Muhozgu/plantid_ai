import { Camera, Upload } from 'lucide-react';
import { useState } from 'react';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
}

export function UploadZone({ onImageSelect, selectedImage }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
        isDragging
          ? 'border-green-500 bg-green-50'
          : 'border-green-200 bg-green-50/30 hover:bg-green-50/50'
      }`}
    >
      {selectedImage ? (
        <div className="space-y-4">
          <img
            src={selectedImage}
            alt="Selected plant"
            className="mx-auto max-h-64 rounded-xl object-cover shadow-md"
          />
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            Choose Different Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-6 rounded-full">
              <Camera className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              Upload a clear photo of a plant leaf or flower
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-colors cursor-pointer shadow-sm">
            <Upload className="w-5 h-5" />
            Browse Files
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
