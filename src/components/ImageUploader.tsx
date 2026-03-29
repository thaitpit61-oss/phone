import React from 'react';
import { Upload, Button, Tooltip, Badge, Popconfirm, Empty, Typography, App } from 'antd';
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
        <Text strong className="text-gray-700">Hình ảnh sản phẩm ({existingImages.length + fileList.length}/{maxCount})</Text>
        <Text type="secondary" className="text-xs italic">* Kéo thả hoặc chọn nhiều ảnh</Text>
      </div>
      
      {/* Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Existing Images */}
        {existingImages.map((img, index) => (
          <div key={img.id} className="relative group aspect-square border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
            <img 
              src={img.public_url} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Product"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <div className="flex gap-2">
                <Tooltip title={img.is_cover ? "Ảnh đại diện" : "Đặt làm ảnh đại diện"}>
                  <Button 
                    size="small" 
                    shape="circle"
                    icon={img.is_cover ? <StarFilled className="text-yellow-400" /> : <StarOutlined />} 
                    onClick={() => onSetCover(img.id)}
                    className={img.is_cover ? "border-yellow-400" : ""}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa ảnh này?"
                  onConfirm={() => onDeleteExisting(img.id, img.storage_path)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" shape="circle" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="small" 
                  shape="circle"
                  icon={<ArrowUpOutlined />} 
                  disabled={index === 0}
                  onClick={() => onMove(index, 'up')}
                />
                <Button 
                  size="small" 
                  shape="circle"
                  icon={<ArrowDownOutlined />} 
                  disabled={index === existingImages.length - 1}
                  onClick={() => onMove(index, 'down')}
                />
              </div>
            </div>

            {/* Cover Badge */}
            {img.is_cover && (
              <div className="absolute top-2 left-2">
                <Badge 
                  count="Ảnh chính" 
                  style={{ backgroundColor: '#1677ff', fontSize: '10px', height: '18px', lineHeight: '18px' }} 
                />
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
            className="uploader-custom"
          >
            <div className="flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
              <PlusOutlined className="text-2xl mb-2" />
              <div className="text-xs font-medium">Thêm ảnh</div>
            </div>
          </Upload>
        )}
      </div>

      {existingImages.length === 0 && fileList.length === 0 && (
        <div className="py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <PictureOutlined className="text-4xl mb-3 opacity-20" />
          <Text type="secondary">Chưa có hình ảnh nào</Text>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
