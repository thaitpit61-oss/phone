import React, { useState, useRef, useEffect } from 'react';
import { Button, Badge, Empty, Typography } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CheckCircleFilled, 
  CloseCircleFilled,
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
      <div className="aspect-square bg-gray-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
        <Empty description="Chưa có hình ảnh" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-white rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl shadow-gray-100 group border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={sortedImages[activeIndex].id}
            src={sortedImages[activeIndex].public_url}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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

        {/* Status Badge */}
        <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10">
          <Badge 
            count={status === 'available' ? 'Sẵn hàng' : 'Đã bán'} 
            style={{ 
              backgroundColor: status === 'available' ? '#52c41a' : '#ff4d4f',
              padding: '0 12px',
              height: '28px',
              lineHeight: '28px',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
            className="sm:hidden"
          />
          <Badge 
            count={status === 'available' ? 'Sẵn hàng' : 'Đã bán'} 
            style={{ 
              backgroundColor: status === 'available' ? '#52c41a' : '#ff4d4f',
              padding: '0 16px',
              height: '32px',
              lineHeight: '32px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
            className="hidden sm:block"
          />
        </div>

        {/* Navigation Arrows - Hidden on small mobile */}
        {sortedImages.length > 1 && (
          <>
            <Button 
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-lg border-none bg-white/80 hover:bg-white backdrop-blur-sm h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center hidden sm:flex"
              icon={<LeftOutlined />}
              onClick={prevImage}
            />
            <Button 
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-lg border-none bg-white/80 hover:bg-white backdrop-blur-sm h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center hidden sm:flex"
              icon={<RightOutlined />}
              onClick={nextImage}
            />
          </>
        )}

        {/* Zoom Icon Hint */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-md text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
          <ExpandAltOutlined className="text-lg sm:text-xl" />
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div 
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedImages.map((img, index) => (
            <motion.div
              key={img.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIndex(index)}
              className={`
                flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all snap-center
                ${activeIndex === index ? 'border-blue-500 shadow-lg shadow-blue-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}
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
