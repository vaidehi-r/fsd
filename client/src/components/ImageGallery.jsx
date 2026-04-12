import { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

const ImageGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center text-slate-400">
        No images available
      </div>
    );
  }

  const goTo = (index) => {
    setSelectedIndex((index + images.length) % images.length);
  };

  return (
    <>
      {/* Main gallery */}
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative rounded-xl overflow-hidden bg-gray-100 h-80 cursor-pointer group"
          onClick={() => setLightboxOpen(true)}>
          <img
            src={images[selectedIndex]?.url}
            alt={`Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-lg">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>

        {/* Thumbnail row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === selectedIndex ? 'border-primary-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10">
            <HiX className="text-3xl" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goTo(selectedIndex - 1); }}
            className="absolute left-4 text-white/80 hover:text-white p-2">
            <HiChevronLeft className="text-4xl" />
          </button>
          <img
            src={images[selectedIndex]?.url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); goTo(selectedIndex + 1); }}
            className="absolute right-4 text-white/80 hover:text-white p-2">
            <HiChevronRight className="text-4xl" />
          </button>
          <span className="absolute bottom-4 text-white/80 text-sm">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
