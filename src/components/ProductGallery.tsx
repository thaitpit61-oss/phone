import React, { useState, useRef, useEffect } from 'react';
import { Button, Empty, Typography } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ExpandAltOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import type { PhoneImage } from '../types';

const { Text } = Typography;

interface ProductGalleryProps {
  images: PhoneImage[];
  status: 'available' | 'sold';
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, status }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeThumb = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square bg-surface rounded-[40px] flex flex-col items-center justify-center border-2 border-dashed border-border">
        <Empty description={<Text className="text-text-muted font-bold">Chưa có hình ảnh</Text>} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-surface rounded-[48px] overflow-hidden group border border-border">
        <AnimatePresence mode="wait">
          <motion.img
            key={sortedImages[activeIndex].id}
            src={sortedImages[activeIndex].public_url}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            alt="Product Main"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) prevImage();
              else if (info.offset.x < -50) nextImage();
            }}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button 
              className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-xl w-14 h-14 rounded-full flex items-center justify-center text-primary shadow-2xl hover:bg-white active:scale-90"
              onClick={prevImage}
            >
              <LeftOutlined className="text-xl" />
            </button>
            <button 
              className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-xl w-14 h-14 rounded-full flex items-center justify-center text-primary shadow-2xl hover:bg-white active:scale-90"
              onClick={nextImage}
            >
              <RightOutlined className="text-xl" />
            </button>
          </>
        )}

        {/* Zoom Icon Hint */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-md text-white w-12 h-12 rounded-2xl flex items-center justify-center">
          <ExpandAltOutlined className="text-xl" />
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x"
        >
          {sortedImages.map((img, index) => (
            <motion.div
              key={img.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIndex(index)}
              className={`
                flex-shrink-0 w-24 h-24 rounded-3xl overflow-hidden cursor-pointer border-4 transition-all snap-center
                ${activeIndex === index ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}
              `}
            >
              <img 
                src={img.public_url} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                alt={`Thumbnail ${index}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
