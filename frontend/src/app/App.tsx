import { useState } from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { PlantResultCard } from './components/PlantResultCard';
import { FeedbackButtons } from './components/FeedbackButtons';

export default function App() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedImageUrl(url);
    setShowResults(false);
  };

  const handleIdentify = () => {
    setIsIdentifying(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsIdentifying(false);
      setShowResults(true);
    }, 2000);
  };

  // Mock plant data for demo
  const plantData = {
    imageUrl: selectedImageUrl || 'https://images.unsplash.com/photo-1626929252164-27c26d107b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25zdGVyYSUyMHBsYW50fGVufDF8fHx8MTc2NzQyODgyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    commonName: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    family: 'Araceae',
    confidence: 94,
    description: 'Also known as the Swiss Cheese Plant, this tropical flowering plant is native to Central America. It is characterized by its large, glossy, heart-shaped leaves with distinctive splits and holes. Popular as an ornamental houseplant due to its striking appearance and relatively easy care requirements.',
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
          {showResults && (
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
