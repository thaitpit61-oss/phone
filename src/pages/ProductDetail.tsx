import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Button, Row, Col, Breadcrumb, 
  Tag, Space, Divider, Spin, Empty, App, Card as AntdCard,
  Alert, Badge
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  SafetyCertificateOutlined, 
  TruckOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Phone } from '../types';
import ProductGallery from '../components/ProductGallery';

const { Title, Text, Paragraph } = Typography;
const Card: any = AntdCard;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!isSupabaseConfigured || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phones')
        .select(`
          *,
          images:phone_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPhone(data);
    } catch (error: any) {
      message.error('Lỗi khi tải thông tin sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spin size="large" />
        <Text type="secondary">Đang tải thông tin sản phẩm...</Text>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Card className="rounded-[32px] border-none shadow-xl shadow-gray-100 py-20 text-center">
          <Empty description="Không tìm thấy sản phẩm" />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="mt-6 rounded-xl h-12 px-8"
          >
            Quay lại trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        className="mb-8"
        items={[
          { title: <span className="cursor-pointer" onClick={() => navigate('/')}><HomeOutlined /> Trang chủ</span> },
          { title: phone.brand },
          { title: phone.name },
        ]}
      />

      <Card className="rounded-2xl sm:rounded-[40px] border-none shadow-2xl shadow-gray-100 overflow-hidden bg-white">
        <Row gutter={[24, 24]} className="p-4 sm:p-8 lg:p-12">
          {/* Left Column: Gallery */}
          <Col xs={24} lg={10}>
            <ProductGallery images={phone.images || []} status={phone.status} />
          </Col>

          {/* Right Column: Information */}
          <Col xs={24} lg={14}>
            <div className="flex flex-col h-full">
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <Space align="center" size="middle" className="flex-wrap">
                  <Tag color="blue" className="m-0 rounded-full px-3 sm:px-4 py-0.5 sm:py-1 border-none font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                    {phone.brand}
                  </Tag>
                  <Text type="secondary" className="text-[10px] sm:text-xs">SKU: {phone.id.substring(0, 8).toUpperCase()}</Text>
                </Space>
                
                <Title level={1} className="!m-0 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                  {phone.name}
                </Title>

                <div className="flex items-baseline gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <Text className="text-3xl sm:text-4xl font-black text-blue-600">
                    {phone.price.toLocaleString('vi-VN')} đ
                  </Text>
                  <Text delete type="secondary" className="text-lg sm:text-xl">
                    {(phone.price * 1.1).toLocaleString('vi-VN')} đ
                  </Text>
                </div>
              </div>

              {/* Status Box */}
              <div className="mb-6 sm:mb-8">
                <Alert
                  message={
                    <span className="font-bold text-gray-800 text-sm sm:text-base">
                      {phone.status === 'available' ? 'Sản phẩm đang có sẵn tại cửa hàng' : 'Sản phẩm này hiện đã hết hàng'}
                    </span>
                  }
                  description={
                    <span className="text-xs sm:text-sm">
                      {phone.status === 'available' 
                        ? "Hỗ trợ giao hàng nhanh trong 2h tại nội thành." 
                        : "Vui lòng liên hệ để đặt hàng đợt tiếp theo."}
                    </span>
                  }
                  type={phone.status === 'available' ? "success" : "warning"}
                  showIcon
                  icon={phone.status === 'available' ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
                  className="rounded-xl sm:rounded-2xl border-none shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <Title level={5} className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <InfoCircleOutlined className="text-blue-500" />
                  Mô tả sản phẩm
                </Title>
                <Paragraph className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {phone.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                </Paragraph>
              </div>

              <Divider className="my-6 sm:my-8" />

              {/* Extra Info */}
              <Row gutter={[12, 12]} className="mb-8 sm:mb-10">
                <Col xs={12} sm={12}>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 h-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                      <SafetyCertificateOutlined className="text-lg" />
                    </div>
                    <div>
                      <Text strong className="block text-[10px] sm:text-xs">Bảo hành</Text>
                      <Text type="secondary" className="text-[9px] sm:text-[10px]">12 tháng</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={12}>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 h-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600">
                      <TruckOutlined className="text-lg" />
                    </div>
                    <div>
                      <Text strong className="block text-[10px] sm:text-xs">Giao hàng</Text>
                      <Text type="secondary" className="text-[9px] sm:text-[10px]">Toàn quốc</Text>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* CTA Buttons */}
              <div className="mt-auto">
                <Row gutter={12}>
                  <Col span={18}>
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      icon={<ShoppingCartOutlined />}
                      className="h-14 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black shadow-xl shadow-blue-200 uppercase tracking-wider"
                      disabled={phone.status === 'sold'}
                    >
                      Mua ngay
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button 
                      size="large" 
                      block 
                      className="h-14 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center"
                    >
                      <ShoppingCartOutlined className="text-xl sm:text-2xl" />
                    </Button>
                  </Col>
                </Row>
                <div className="text-center mt-4">
                  <Text type="secondary" className="text-[10px] sm:text-xs">
                    Gọi đặt mua <Text strong className="text-red-500">0375207610</Text> (có zalo)
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Related Products Placeholder */}
      <div className="mt-20">
        <Title level={3} className="mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          Sản phẩm tương tự
        </Title>
        <div className="py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <Text type="secondary">Tính năng đang được phát triển...</Text>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
