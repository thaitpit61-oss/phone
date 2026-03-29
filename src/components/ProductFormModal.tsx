import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, InputNumber, Select, Row, Col, 
  Button, Space, Typography, App, Divider, Tag, Badge 
} from 'antd';
import { 
  InfoCircleOutlined, 
  PictureOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import ImageUploader from './ImageUploader';
import type { Phone, PhoneImage } from '../types';
import type { UploadFile } from 'antd/es/upload/interface';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProductFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingPhone: Phone | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  editingPhone
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<PhoneImage[]>([]);

  useEffect(() => {
    if (open) {
      if (editingPhone) {
        form.setFieldsValue({
          name: editingPhone.name,
          brand: editingPhone.brand,
          price: editingPhone.price,
          status: editingPhone.status,
          description: editingPhone.description,
        });
        setExistingImages(editingPhone.images || []);
      } else {
        form.resetFields();
        setExistingImages([]);
      }
      setFileList([]);
    }
  }, [open, editingPhone, form]);

  const handleFinish = async (values: any) => {
    if (!isSupabaseConfigured) return;
    
    setUploading(true);
    try {
      let phoneId = editingPhone?.id;
      
      // 1. Save Phone info
      if (editingPhone) {
        const { error } = await supabase
          .from('phones')
          .update({
            name: values.name,
            brand: values.brand,
            price: values.price,
            status: values.status,
            description: values.description,
          })
          .eq('id', editingPhone.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('phones')
          .insert([{
            name: values.name,
            brand: values.brand,
            price: values.price,
            status: values.status || 'available',
            description: values.description,
          }])
          .select();
        if (error) throw error;
        phoneId = data[0].id;
      }

      // 2. Upload new images
      if (fileList.length > 0 && phoneId) {
        for (const file of fileList) {
          if (!file.originFileObj) continue;
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${phoneId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from('phone-images')
            .upload(filePath, file.originFileObj);

          if (uploadError) throw uploadError;

          const { data: publicData } = supabase.storage
            .from('phone-images')
            .getPublicUrl(filePath);

          // Save image record
          const { error: dbError } = await supabase
            .from('phone_images')
            .insert([{
              phone_id: phoneId,
              storage_path: filePath,
              public_url: publicData.publicUrl,
              is_cover: false,
              sort_order: existingImages.length + fileList.indexOf(file)
            }]);
          
          if (dbError) throw dbError;
        }
      }

      // 3. Update existing images (is_cover, sort_order)
      if (editingPhone && existingImages.length > 0) {
        for (const img of existingImages) {
          const { error } = await supabase
            .from('phone_images')
            .update({
              is_cover: img.is_cover,
              sort_order: img.sort_order
            })
            .eq('id', img.id);
          if (error) throw error;
        }
      }

      message.success(editingPhone ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      onSuccess();
    } catch (error: any) {
      message.error('Thao tác thất bại: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExistingImage = async (imageId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('phone-images')
        .remove([storagePath]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('phone_images')
        .delete()
        .eq('id', imageId);
      
      if (dbError) throw dbError;

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      message.success('Đã xóa ảnh');
    } catch (error: any) {
      message.error('Lỗi khi xóa ảnh: ' + error.message);
    }
  };

  const handleSetCover = (imageId: string) => {
    setExistingImages(prev => prev.map(img => ({
      ...img,
      is_cover: img.id === imageId
    })));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...existingImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    const updatedImages = newImages.map((img, i) => ({
      ...img,
      sort_order: i
    }));
    
    setExistingImages(updatedImages);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 py-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            {editingPhone ? <SaveOutlined /> : <PictureOutlined />}
          </div>
          <div>
            <Title level={4} className="!m-0 text-lg sm:text-xl">{editingPhone ? "Cập nhật điện thoại" : "Thêm điện thoại mới"}</Title>
            <Text type="secondary" className="text-[10px] sm:text-xs font-normal">Vui lòng điền đầy đủ thông tin sản phẩm</Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      className="product-modal"
      maskClosable={false}
      style={{ top: 20 }}
    >
      <Divider className="my-0" />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        size="large"
        className="py-4 sm:py-6"
      >
        <Row gutter={[24, 24]}>
          {/* Left Column: Information */}
          <Col xs={24} lg={12}>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <InfoCircleOutlined className="text-blue-500" />
                <Text strong className="text-gray-700 text-sm sm:text-base">Thông tin cơ bản</Text>
              </div>

              <Row gutter={12}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên máy!' }]}
                    className="mb-3 sm:mb-4"
                  >
                    <Input placeholder="Ví dụ: iPhone 15 Pro Max" className="rounded-xl shadow-sm border-gray-200" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="brand"
                    label="Thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng nhập thương hiệu!' }]}
                    className="mb-3 sm:mb-4"
                  >
                    <Input placeholder="Apple" className="rounded-xl shadow-sm border-gray-200" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label="Giá bán (VND)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    className="mb-3 sm:mb-4"
                  >
                    <InputNumber 
                      className="w-full rounded-xl shadow-sm border-gray-200" 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                      placeholder="30,000,000"
                      addonAfter="đ"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    initialValue="available"
                    className="mb-3 sm:mb-4"
                  >
                    <Select 
                      className="rounded-xl shadow-sm border-gray-200"
                      options={[
                        { 
                          value: 'available', 
                          label: (
                            <div className="flex items-center gap-2">
                              <Badge status="success" />
                              <span>Sẵn hàng</span>
                            </div>
                          ) 
                        },
                        { 
                          value: 'sold', 
                          label: (
                            <div className="flex items-center gap-2">
                              <Badge status="error" />
                              <span>Đã bán</span>
                            </div>
                          ) 
                        }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Mô tả chi tiết"
                className="mb-0"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Nhập mô tả chi tiết về sản phẩm, tính năng, tình trạng máy..." 
                  className="rounded-2xl shadow-sm border-gray-200"
                />
              </Form.Item>
            </div>
          </Col>

          {/* Right Column: Images */}
          <Col xs={24} lg={12}>
            <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 h-full">
              <ImageUploader 
                existingImages={existingImages}
                fileList={fileList}
                onFileListChange={setFileList}
                onDeleteExisting={handleDeleteExistingImage}
                onSetCover={handleSetCover}
                onMove={handleMoveImage}
              />
            </div>
          </Col>
        </Row>

        <Divider className="my-6 sm:my-8" />

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button 
            onClick={onCancel} 
            disabled={uploading}
            className="rounded-xl h-10 sm:h-12 px-8 border-gray-200 hover:text-gray-600 order-2 sm:order-1"
            type="text"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={uploading}
            className="rounded-xl h-10 sm:h-12 px-12 shadow-lg shadow-blue-200 font-bold order-1 sm:order-2"
            icon={<SaveOutlined />}
          >
            {editingPhone ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
