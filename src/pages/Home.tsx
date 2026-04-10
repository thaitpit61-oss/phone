import React, { useState, useEffect } from 'react';
import {
  Typography, Row, Col, Input, Select, Empty, Spin, App, Tooltip, Popconfirm, Tag
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Phone } from '../types';
import ProductFormModal from '../components/ProductFormModal';
import type { Session } from '@supabase/supabase-js';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { session } = useOutletContext<{ session: Session | null }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    if (!isSupabaseConfigured) {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (error: any) {
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('phones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      message.success('Đã xóa sản phẩm');
      fetchPhones();
    } catch (error: any) {
      message.error('Lỗi khi xóa: ' + error.message);
    }
  };

  const filteredPhones = phones.filter(phone => {
    const matchesSearch = phone.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         phone.brand.toLowerCase().includes(searchText.toLowerCase());
    const matchesBrand = brandFilter === 'all' || phone.brand === brandFilter;
    const matchesStatus = statusFilter === 'all' || phone.status === statusFilter;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const brands = Array.from(new Set(phones.map(p => p.brand)));

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section - Mới, sạch và sang */}
      <div className="relative h-[520px] sm:h-[620px] flex items-center rounded-[48px] overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#ffffff08_0%,transparent_70%)]" />
        
        <div className="relative z-10 max-w-3xl px-8 sm:px-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 mb-6">
            <span className="text-xs font-black uppercase tracking-[0.125em] text-white/90">2026 COLLECTION</span>
          </div>

          <Title level={1} className="!text-white !m-0 !text-6xl sm:!text-7xl lg:!text-8xl font-black tracking-tighter leading-none">
            Điện thoại<br />cao cấp chính hãng
          </Title>

          <p className="mt-6 text-white/70 text-xl sm:text-2xl max-w-lg font-medium">
            Những chiếc điện thoại tốt nhất với giá cạnh tranh nhất tại Việt Nam.
          </p>

          <button 
            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
            className="mt-10 btn-accent !h-16 !px-14 !text-lg shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all"
          >
            KHÁM PHÁ NGAY
          </button>
        </div>

        {/* Decorative phone image / overlay */}
        <div className="absolute -bottom-20 right-10 hidden xl:block opacity-40">
          <ShoppingOutlined className="text-[420px] text-white/10" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-6 z-40 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-[40px] border border-border shadow-xl">
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} lg={10}>
            <Input
              prefix={<SearchOutlined className="text-text-muted text-xl" />}
              placeholder="Tìm kiếm theo tên hoặc hãng..."
              size="large"
              className="!bg-surface !border-none !h-16 !px-8 !text-lg font-medium !rounded-3xl placeholder:text-text-muted"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} lg={5}>
            <Select
              className="w-full custom-select-modern"
              size="large"
              value={brandFilter}
              onChange={setBrandFilter}
              options={[
                { value: 'all', label: 'TẤT CẢ HÃNG' },
                ...brands.map(brand => ({ value: brand, label: brand.toUpperCase() }))
              ]}
            />
          </Col>

          <Col xs={12} lg={5}>
            <Select
              className="w-full custom-select-modern"
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'TẤT CẢ TRẠNG THÁI' },
                { value: 'available', label: 'SẴN HÀNG' },
                { value: 'sold', label: 'ĐÃ BÁN' }
              ]}
            />
          </Col>

          {session && (
            <Col xs={24} lg={4}>
              <button
                onClick={() => {
                  setEditingPhone(null);
                  setIsModalOpen(true);
                }}
                className="btn-accent w-full !h-16 !rounded-3xl flex items-center justify-center gap-2 shadow-xl"
              >
                <PlusOutlined />
                <span>THÊM SẢN PHẨM</span>
              </button>
            </Col>
          )}
        </Row>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-40 flex flex-col items-center gap-6">
          <Spin size="large" className="scale-150" />
          <Text className="text-text-muted font-black tracking-widest uppercase text-xs">Đang tải sản phẩm...</Text>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="py-40 bg-surface rounded-[48px] border-2 border-dashed border-border text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text className="text-text-muted font-bold text-lg">Không tìm thấy sản phẩm</Text>}
          />
        </div>
      ) : (
        <Row gutter={[28, 32]}>
          {filteredPhones.map((phone) => {
            const coverImg = phone.images?.find(img => img.is_cover) || phone.images?.[0];

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={phone.id}>
                <div className="card-modern group h-full flex flex-col overflow-hidden rounded-3xl border border-border hover:border-primary/30 transition-all duration-300">
                  {/* Image */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden bg-surface cursor-pointer"
                    onClick={() => navigate(`/product/${phone.id}`)}
                  >
                    {coverImg ? (
                      <img
                        alt={phone.name}
                        src={coverImg.public_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                        <ShoppingOutlined className="text-8xl opacity-10" />
                      </div>
                    )}

                    {/* Status Tag */}
                    <div className="absolute top-5 left-5">
                      <Tag
                        color={phone.status === 'available' ? 'success' : 'error'}
                        className="!m-0 !bg-white/95 !backdrop-blur !text-xs !font-black !px-4 !py-1 !rounded-full shadow-md"
                      >
                        {phone.status === 'available' ? 'SẴN HÀNG' : 'ĐÃ BÁN'}
                      </Tag>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${phone.id}`);
                        }}
                        className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <ArrowRightOutlined className="text-2xl" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex-1 flex flex-col">
                    <Text className="text-xs font-black text-primary tracking-widest uppercase mb-1">
                      {phone.brand}
                    </Text>
                    
                    <Title
                      level={4}
                      className="!m-0 !text-[22px] font-semibold tracking-tight line-clamp-2 min-h-[56px] cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/product/${phone.id}`)}
                    >
                      {phone.name}
                    </Title>

                    <div className="mt-auto pt-8">
                      <div className="flex items-baseline gap-2">
                        <Text className="text-4xl font-black tracking-tighter text-primary">
                          {phone.price.toLocaleString('vi-VN')}
                        </Text>
                        <Text className="text-base font-bold text-text-muted">VND</Text>
                      </div>

                      <div className="flex gap-3 mt-7">
                        <button
                          className="btn-accent flex-1 h-14 rounded-2xl font-semibold"
                          onClick={() => navigate(`/product/${phone.id}`)}
                        >
                          XEM CHI TIẾT
                        </button>

                        {session && (
                          <div className="flex gap-2">
                            <Tooltip title="Chỉnh sửa">
                              <button
                                onClick={() => {
                                  setEditingPhone(phone);
                                  setIsModalOpen(true);
                                }}
                                className="w-14 h-14 rounded-2xl border border-border hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                              >
                                <EditOutlined />
                              </button>
                            </Tooltip>
                            <Popconfirm
                              title="Xóa sản phẩm này?"
                              onConfirm={() => handleDelete(phone.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="w-14 h-14 rounded-2xl border border-border hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                                <DeleteOutlined />
                              </button>
                            </Popconfirm>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal */}
      <ProductFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPhones();
        }}
        editingPhone={editingPhone}
      />
    </div>
  );
};

export default Home;