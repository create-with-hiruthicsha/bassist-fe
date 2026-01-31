import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  message = "Hoorayyyyy, all tasks are created!" 
}: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Create confetti pieces
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const newConfetti: ConfettiPiece[] = [];
      
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2,
          gravity: 0.1
        });
      }
      
      setConfetti(newConfetti);
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setConfetti([]);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || confetti.length === 0) return;

    const animate = () => {
      setConfetti(prev => 
        prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          velocityY: piece.velocityY + piece.gravity,
          rotation: piece.rotation + 2
        })).filter(piece => piece.y < window.innerHeight + 50)
      );
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isOpen, confetti.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute pointer-events-none"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '50%'
          }}
        />
      ))}
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-bounce">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Success! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
