import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Row, Col, Breadcrumb,
  Tag, Divider, Spin, Empty, App, Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Phone } from '../types';
import ProductGallery from '../components/ProductGallery';

const { Title, Text, Paragraph } = Typography;

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Spin size="large" className="scale-150" />
        <Text className="text-text-muted font-black tracking-widest uppercase text-xs">Đang tải dữ liệu sản phẩm...</Text>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-surface rounded-[48px] p-20 text-center border border-border">
          <Empty description={<Text className="text-text-muted font-bold">Không tìm thấy sản phẩm</Text>} />
          <button
            onClick={() => navigate('/')}
            className="btn-primary mt-8 mx-auto"
          >
            <ArrowLeftOutlined />
            <span>QUAY LẠI TRANG CHỦ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-20 pb-20">
      {/* Breadcrumb + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
        <Breadcrumb
          className="!text-xs font-bold uppercase tracking-widest text-text-muted"
          items={[
            { title: <span className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1" onClick={() => navigate('/')}><HomeOutlined /> TRANG CHỦ</span> },
            { title: phone.brand },
            { title: phone.name },
          ]}
        />
        <div className="flex items-center gap-3">
          <button className="w-11 h-11 rounded-2xl border border-border flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-all active:scale-95">
            <HeartOutlined className="text-lg" />
          </button>
          <button className="w-11 h-11 rounded-2xl border border-border flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-all active:scale-95">
            <ShareAltOutlined className="text-lg" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <ProductGallery images={phone.images || []} status={phone.status} />
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-10">
          {/* Brand + Name */}
          <div className="space-y-5">
            <Tag color="blue" className="!m-0 !bg-primary/10 !text-primary !border-none !px-5 !py-1.5 !rounded-full !font-black !text-xs !uppercase tracking-[0.125em]">
              {phone.brand}
            </Tag>

            <Title level={1} className="!m-0 !text-5xl sm:!text-6xl lg:!text-7xl font-black tracking-[-0.04em] leading-none">
              {phone.name}
            </Title>
          </div>
          {/* ==================== PHẦN GIÁ SIÊU TO & NỔI BẬT ==================== */}
          <div className="pt-2 pb-6">
            <div className="flex items-baseline gap-3">
              <span
                className="font-black tracking-[-0.04em] bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-md"
                style={{
                  fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',   // nhỏ lại đáng kể         
                  lineHeight: '0.95',
                  fontWeight: '900'
                }}
              >
                {phone.price.toLocaleString('vi-VN')}
              </span>
              <span className="text-4xl sm:text-5xl font-bold text-text-muted/90 tracking-widest self-end pb-4">
                VND
              </span>
            </div>

            {/* Glow layer */}
            <div className="h-8 -mt-5 bg-gradient-to-r from-primary/30 to-transparent blur-3xl rounded-full" />
          </div>

          {/* Status Alert */}
          <Alert
            message={
              <span className="font-black text-sm uppercase tracking-widest">
                {phone.status === 'available' ? '✓ SẴN HÀNG' : 'TẠM HẾT HÀNG'}
              </span>
            }
            description={
              <span className="text-base font-medium">
                {phone.status === 'available'
                  ? "Giao nhanh nội thành trong 2 giờ • Miễn phí vận chuyển toàn quốc với đơn từ 5 triệu"
                  : "Sẽ về hàng trong tuần tới. Liên hệ ngay để đặt trước!"}
              </span>
            }
            type={phone.status === 'available' ? "success" : "warning"}
            showIcon
            icon={phone.status === 'available' ? <CheckCircleOutlined className="text-xl" /> : <InfoCircleOutlined className="text-xl" />}
            className="!rounded-3xl !border-0 !bg-surface/80 !p-7 shadow-lg backdrop-blur-sm"
          />

          {/* Description */}
          <div className="space-y-5">
            <div className="uppercase text-xs font-black tracking-[0.2em] text-text-muted">MÔ TẢ</div>
            <Paragraph className="text-lg leading-relaxed text-text-muted font-medium whitespace-pre-wrap">
              {phone.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
            </Paragraph>
          </div>

          <Divider className="!my-6 !border-border" />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-7 rounded-3xl bg-surface border border-border/60 hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                <SafetyCertificateOutlined />
              </div>
              <div className="space-y-1">
                <Text className="block text-xs font-black uppercase tracking-widest text-text-muted">Bảo hành chính hãng</Text>
                <Text className="text-2xl font-black">12 THÁNG</Text>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-surface border border-border/60 hover:border-green-500/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                <TruckOutlined />
              </div>
              <div className="space-y-1">
                <Text className="block text-xs font-black uppercase tracking-widest text-text-muted">Giao hàng</Text>
                <Text className="text-2xl font-black">TOÀN QUỐC • NHANH</Text>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <div className="pt-6 space-y-6">
            <button
              className="btn-accent w-full h-20 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 active:scale-[0.985] transition-all flex items-center justify-center gap-4 disabled:opacity-60"
              disabled={phone.status === 'sold'}
            >
              <ShoppingCartOutlined className="text-3xl" />
              MUA NGAY
            </button>

            <div className="text-center">
              <Text className="text-sm text-text-muted">
                Hỗ trợ tư vấn Zalo: <span className="text-accent font-semibold">0375207610</span>
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="pt-12 border-t border-border">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-8 bg-primary rounded-full" />
          <Title level={2} className="!m-0 !text-4xl font-black tracking-tight">SẢN PHẨM TƯƠNG TỰ</Title>
        </div>
        <div className="py-32 bg-surface rounded-[48px] border border-dashed border-border flex flex-col items-center justify-center text-text-muted gap-6">
          <ShoppingCartOutlined className="text-7xl opacity-10" />
          <Text className="font-black tracking-widest uppercase text-sm opacity-60">Đang cập nhật...</Text>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;