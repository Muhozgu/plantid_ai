import { useState } from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { PlantResultCard } from './components/PlantResultCard';
import { FeedbackButtons } from './components/FeedbackButtons';

export default function App() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [plantData, setPlantData] = useState<any>(null);

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedImageUrl(url);
    setSelectedFile(file);
    setShowResults(false);
    setPlantData(null);
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;
    
    setIsIdentifying(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to identify plant");

      const data = await response.json();
      
      setPlantData({
        imageUrl: selectedImageUrl,
        commonName: data.common_name,
        scientificName: data.scientific_name,
        family: data.family,
        confidence: Math.round(data.confidence * 100),
        description: data.description,
      });
      setShowResults(true);
    } catch (error) {
      console.error("Identification error:", error);
      // Fallback to mock data if backend is not available for demo purposes
      setPlantData({
        imageUrl: selectedImageUrl,
        commonName: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        family: 'Araceae',
        confidence: 94,
        description: 'Also known as the Swiss Cheese Plant, this tropical flowering plant is native to Central America. It is characterized by its large, glossy, heart-shaped leaves with distinctive splits and holes.',
      });
      setShowResults(true);
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-green-800">PlantID AI</h1>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Identify plants instantly from photos
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-green-100">
          {/* Upload Zone */}
          <UploadZone
            onImageSelect={handleImageSelect}
            selectedImage={selectedImageUrl}
          />

          {/* Identify Button */}
          {selectedImageUrl && (
            <div className="text-center">
              <button
                onClick={handleIdentify}
                disabled={isIdentifying}
                className="inline-flex items-center gap-3 px-10 py-4 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                {isIdentifying ? 'Identifying...' : 'Identify Plant'}
              </button>
            </div>
          )}

          {/* Results Section */}
          {showResults && plantData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-t border-green-100 pt-6">
                <h2 className="text-center mb-6 text-green-800">
                  Identification Result
                </h2>
                <PlantResultCard {...plantData} />
              </div>

              {/* Feedback Section */}
              <FeedbackButtons />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm inline-block px-6 py-3 rounded-full border border-green-100">
            AI-based identification – results may not be 100% accurate
          </p>
        </footer>
      </div>
    </div>
  );
}
