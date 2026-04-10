import React from 'react';
import { Upload, Tooltip, Popconfirm, Empty, Typography } from 'antd';
import { 
  PlusOutlined, DeleteOutlined, StarOutlined, StarFilled, 
  ArrowUpOutlined, ArrowDownOutlined, PictureOutlined 
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { PhoneImage } from '../types';

const { Text } = Typography;

interface ImageUploaderProps {
  existingImages: PhoneImage[];
  fileList: UploadFile[];
  onFileListChange: (fileList: UploadFile[]) => void;
  onDeleteExisting: (imageId: string, storagePath: string) => void;
  onSetCover: (imageId: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  maxCount?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  existingImages,
  fileList,
  onFileListChange,
  onDeleteExisting,
  onSetCover,
  onMove,
  maxCount = 10
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Text className="text-xs font-black uppercase tracking-widest text-text-muted">
          Hình ảnh ({existingImages.length + fileList.length}/{maxCount})
        </Text>
        <Text className="text-[10px] font-bold text-primary uppercase tracking-tighter italic">
          * Kéo thả hoặc chọn nhiều ảnh
        </Text>
      </div>
      
      {/* Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Existing Images */}
        {existingImages.map((img, index) => (
          <div key={img.id} className="relative group aspect-square border border-border rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
            <img 
              src={img.public_url} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Product"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4">
              <div className="flex gap-2">
                <Tooltip title={img.is_cover ? "Ảnh đại diện" : "Đặt làm ảnh đại diện"}>
                  <button 
                    onClick={() => onSetCover(img.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${img.is_cover ? 'bg-accent text-white' : 'bg-white text-text hover:bg-accent hover:text-white'}`}
                  >
                    {img.is_cover ? <StarFilled /> : <StarOutlined />}
                  </button>
                </Tooltip>
                <Popconfirm
                  title="Xóa ảnh này?"
                  onConfirm={() => onDeleteExisting(img.id, img.storage_path)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <button className="w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                    <DeleteOutlined />
                  </button>
                </Popconfirm>
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={index === 0}
                  onClick={() => onMove(index, 'up')}
                  className="w-10 h-10 rounded-full bg-white text-text hover:bg-primary hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowUpOutlined />
                </button>
                <button 
                  disabled={index === existingImages.length - 1}
                  onClick={() => onMove(index, 'down')}
                  className="w-10 h-10 rounded-full bg-white text-text hover:bg-primary hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowDownOutlined />
                </button>
              </div>
            </div>

            {/* Cover Badge */}
            {img.is_cover && (
              <div className="absolute top-3 left-3">
                <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  CHÍNH
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {(existingImages.length + fileList.length) < maxCount && (
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={(file) => {
              window.open(file.url || file.thumbUrl, '_blank');
            }}
            onChange={({ fileList }) => onFileListChange(fileList)}
            beforeUpload={() => false}
            multiple
            showUploadList={true}
            className="uploader-custom-modern"
          >
            <div className="flex flex-col items-center justify-center text-text-muted hover:text-primary transition-all group">
              <PlusOutlined className="text-3xl mb-2 group-hover:scale-125 transition-transform" />
              <div className="text-[10px] font-black uppercase tracking-widest">Thêm ảnh</div>
            </div>
          </Upload>
        )}
      </div>

      {existingImages.length === 0 && fileList.length === 0 && (
        <div className="py-16 bg-surface rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center text-text-muted gap-4">
          <PictureOutlined className="text-5xl opacity-10" />
          <Text className="text-[10px] font-black uppercase tracking-widest opacity-50">Chưa có hình ảnh nào</Text>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
