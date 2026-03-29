import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Card as AntdCard, Row, Col, 
  Input, Select, Space, Badge, Table, Popconfirm, 
  Empty, Spin, App, Tag, Tooltip, Avatar
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, FilterOutlined, 
  ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Phone } from '../types';
import ProductFormModal from '../components/ProductFormModal';

const { Title, Text } = Typography;
const Card: any = AntdCard;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [session, setSession] = useState<any>(null);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchPhones();

    return () => subscription.unsubscribe();
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
      // 1. Get images to delete from storage
      const { data: images } = await supabase
        .from('phone_images')
        .select('storage_path')
        .eq('phone_id', id);

      if (images && images.length > 0) {
        const paths = images.map(img => img.storage_path);
        await supabase.storage.from('phone-images').remove(paths);
      }

      // 2. Delete phone (cascade will delete image records)
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

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    try {
      const { error } = await supabase
        .from('phones')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      message.success('Đã cập nhật trạng thái');
      fetchPhones();
    } catch (error: any) {
      message.error('Lỗi khi cập nhật: ' + error.message);
    }
  };

  const brands = Array.from(new Set(phones.map(p => p.brand))).filter(Boolean);

  const filteredPhones = phones.filter(phone => {
    const matchesSearch = phone.name.toLowerCase().includes(searchText.toLowerCase()) || 
                         phone.brand.toLowerCase().includes(searchText.toLowerCase());
    const matchesBrand = brandFilter === 'all' || phone.brand === brandFilter;
    const matchesStatus = statusFilter === 'all' || phone.status === statusFilter;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (phone: Phone) => {
        const coverImg = phone.images?.find(img => img.is_cover) || phone.images?.[0];
        return (
          <div className="flex items-center gap-4">
            <Avatar 
              src={coverImg?.public_url} 
              shape="square" 
              size={64} 
              className="rounded-xl border border-gray-100"
              icon={<ShoppingOutlined />}
            />
            <div>
              <Text strong className="block text-base">{phone.name}</Text>
              <Tag color="blue" className="rounded-full px-3">{phone.brand}</Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text strong className="text-blue-600 text-base">
          {price.toLocaleString('vi-VN')} đ
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Phone) => (
        <Tooltip title="Click để đổi trạng thái">
          <Tag 
            color={status === 'available' ? 'success' : 'error'} 
            className="rounded-full px-4 py-1 cursor-pointer font-medium"
            onClick={() => handleStatusToggle(record.id, status)}
          >
            {status === 'available' ? 'Sẵn hàng' : 'Đã bán'}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (phone: Phone) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-500" />} 
              onClick={() => {
                setEditingPhone(phone);
                setIsModalOpen(true);
              }}
              className="hover:bg-blue-50 rounded-lg"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Hành động này không thể hoàn tác và sẽ xóa toàn bộ ảnh liên quan."
            onConfirm={() => handleDelete(phone.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                className="hover:bg-red-50 rounded-lg"
              />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<ArrowRightOutlined className="text-gray-400" />} 
              onClick={() => navigate(`/product/${phone.id}`)}
              className="hover:bg-gray-100 rounded-lg"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <ShoppingOutlined className="text-xl sm:text-2xl" />
              </div>
              <div>
                <Title level={2} className="!m-0 tracking-tight font-black text-xl sm:text-2xl lg:text-3xl">Thái Store</Title>
                <Text type="secondary" className="text-xs sm:text-base">Hệ thống quản lý và bán lẻ điện thoại di động cũ</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12} className="sm:text-right">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:justify-end">
              {session && (
                <>
                  <Button.Group className="hidden sm:inline-flex">
                    <Button 
                      icon={<AppstoreOutlined />} 
                      type={viewMode === 'grid' ? 'primary' : 'default'}
                      onClick={() => setViewMode('grid')}
                      className="rounded-l-xl"
                    />
                    <Button 
                      icon={<UnorderedListOutlined />} 
                      type={viewMode === 'table' ? 'primary' : 'default'}
                      onClick={() => setViewMode('table')}
                      className="rounded-r-xl"
                    />
                  </Button.Group>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      setEditingPhone(null);
                      setIsModalOpen(true);
                    }}
                    className="rounded-xl h-10 sm:h-12 px-4 sm:px-8 shadow-lg shadow-blue-200 font-bold flex-1 sm:flex-none"
                  >
                    Thêm điện thoại
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Filter Section */}
      <Card className="mb-8 sm:mb-12 rounded-2xl sm:rounded-[32px] border-none shadow-xl shadow-gray-100 overflow-hidden">
        <div className="p-3 sm:p-6">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={10}>
              <Input 
                prefix={<SearchOutlined className="text-gray-400" />} 
                placeholder="Tìm kiếm điện thoại..." 
                size="large"
                className="rounded-xl sm:rounded-2xl h-12 sm:h-14 border-gray-100 bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} lg={7}>
              <Select 
                className="w-full custom-select" 
                size="large" 
                value={brandFilter} 
                onChange={setBrandFilter}
                options={[
                  { value: 'all', label: 'Tất cả hãng' },
                  ...brands.map(brand => ({ value: brand, label: brand }))
                ]}
              />
            </Col>
            <Col xs={12} lg={7}>
              <Select 
                className="w-full custom-select" 
                size="large" 
                value={statusFilter} 
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'Tất cả kho' },
                  { value: 'available', label: 'Sẵn hàng' },
                  { value: 'sold', label: 'Đã bán' }
                ]}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* Content Section */}
      {loading ? (
        <div className="py-20 sm:py-32 text-center flex flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <Text type="secondary" className="text-gray-500">Đang tải dữ liệu...</Text>
        </div>
      ) : filteredPhones.length === 0 ? (
        <Card className="rounded-2xl sm:rounded-[32px] border-none shadow-xl shadow-gray-100 py-12 sm:py-20">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={
              <div className="space-y-2">
                <div className="text-lg font-bold text-gray-400">Không tìm thấy sản phẩm</div>
                <div className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
              </div>
            } 
          />
        </Card>
      ) : (
        <>
          {viewMode === 'table' && session ? (
            <Card className="rounded-2xl sm:rounded-[32px] border-none shadow-xl shadow-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table 
                  columns={columns} 
                  dataSource={filteredPhones} 
                  rowKey="id"
                  pagination={{ pageSize: 10, className: "px-4 sm:px-6" }}
                  className="custom-table"
                  scroll={{ x: 800 }} // Enable horizontal scroll on small screens
                />
              </div>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredPhones.map((phone) => {
                const coverImg = phone.images?.find(img => img.is_cover) || phone.images?.[0];
                return (
                  <Col xs={12} sm={12} md={8} lg={6} key={phone.id}>
                    <Card
                      hoverable
                      className="h-full rounded-2xl sm:rounded-[32px] border-none shadow-lg shadow-gray-100 overflow-hidden group transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
                      cover={
                        <div 
                          className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gray-50 cursor-pointer"
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
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                              <ShoppingOutlined className="text-3xl sm:text-4xl opacity-20" />
                              <Text type="secondary" className="text-[10px] sm:text-xs">Chưa có ảnh</Text>
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                            <Tag 
                              color={phone.status === 'available' ? 'success' : 'error'} 
                              className="m-0 rounded-full px-2 sm:px-4 py-0.5 sm:py-1 border-none font-bold shadow-md text-[10px] sm:text-xs"
                            >
                              {phone.status === 'available' ? 'Sẵn hàng' : 'Đã bán'}
                            </Tag>
                          </div>
                        </div>
                      }
                    >
                      <div className="flex flex-col h-full text-center">
                        <div className="mb-2 sm:mb-4">
                          <div className="flex justify-center items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <Text type="secondary" className="text-[9px] sm:text-xs uppercase tracking-widest font-bold">{phone.brand}</Text>
                          </div>
                          <Title 
                            level={5} 
                            className="!m-0 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer min-h-[36px] sm:min-h-[48px] text-sm sm:text-base text-center"
                            onClick={() => navigate(`/product/${phone.id}`)}
                          >
                            {phone.name}
                          </Title>
                        </div>
                        
                        <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-50 flex flex-col items-center gap-2">
                          <Text className="text-blue-600 text-3xl sm:text-5xl font-black">
                            {phone.price.toLocaleString('vi-VN')} đ
                          </Text>
                          
                          {session && (
                            <Space size="small" className="w-full justify-center">
                              <Tooltip title="Sửa">
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined className="text-blue-500" />} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPhone(phone);
                                    setIsModalOpen(true);
                                  }}
                                  className="hover:bg-blue-50 rounded-lg sm:rounded-xl h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center"
                                />
                              </Tooltip>
                              <Popconfirm
                                title="Xóa sản phẩm?"
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  handleDelete(phone.id);
                                }}
                                onCancel={(e) => e?.stopPropagation()}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:bg-red-50 rounded-lg sm:rounded-xl h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center"
                                />
                              </Popconfirm>
                            </Space>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      )}

      {/* Product Form Modal */}
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
