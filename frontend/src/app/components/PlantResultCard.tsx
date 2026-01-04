import { Progress } from './ui/progress';

interface PlantResultCardProps {
  imageUrl: string;
  commonName: string;
  scientificName: string;
  family: string;
  confidence: number;
  description: string;
}

export function PlantResultCard({
  imageUrl,
  commonName,
  scientificName,
  family,
  confidence,
  description,
}: PlantResultCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-green-100">
      <div className="flex gap-6 flex-col sm:flex-row">
        <img
          src={imageUrl}
          alt={commonName}
          className="w-full sm:w-32 h-32 rounded-xl object-cover shadow-md flex-shrink-0"
        />
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-green-800">{commonName}</h3>
            <p className="italic text-gray-600">{scientificName}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="text-gray-800">Family:</span> {family}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Confidence Score</span>
              <span className="text-green-700">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2" />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-green-100">
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
