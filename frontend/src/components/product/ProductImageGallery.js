import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const ProductImageGallery = ({ images = [], videos = [], productTitle }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Combine images and videos
  const media = [
    ...images.map(img => ({ type: 'image', url: img })),
    ...videos.map(vid => ({ type: 'video', url: vid }))
  ];

  if (media.length === 0) {
    media.push({ type: 'image', url: 'https://via.placeholder.com/600' });
  }

  const currentMedia = media[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    setIsVideoPlaying(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    setIsVideoPlaying(false);
  };

  return (
    <div className="sticky top-4">
      {/* Main Media Display */}
      <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 relative group">
        <div className="relative aspect-square">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={`${productTitle} ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={currentMedia.url}
                controls={isVideoPlaying}
                className="w-full h-full object-contain"
                onClick={() => setIsVideoPlaying(true)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                >
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <Play className="w-8 h-8 text-gray-900" />
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Navigation Arrows (shown on hover) */}
          {media.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
            </>
          )}
        </div>

        {/* Media Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-8 right-8 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {media.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedIndex(index);
                setIsVideoPlaying(false);
              }}
              className={`aspect-square border-2 rounded-lg overflow-hidden transition-all relative ${
                selectedIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-100">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
