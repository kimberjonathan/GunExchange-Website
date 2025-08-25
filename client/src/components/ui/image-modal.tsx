import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageModal({ images, currentIndex, isOpen, onClose, onNavigate }: ImageModalProps) {
  if (!isOpen || !images.length) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      data-testid="image-modal"
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          data-testid="button-close-modal"
        >
          <X size={24} />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
              data-testid="button-previous-image"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
              data-testid="button-next-image"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          data-testid={`img-modal-${currentIndex}`}
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>
    </div>
  );
}