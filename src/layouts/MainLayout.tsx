import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, App, Alert } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { HomeOutlined, ShoppingOutlined, LoginOutlined, LogoutOutlined, WarningOutlined } from '@ant-design/icons';
import type { Session } from '@supabase/supabase-js';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const { message } = App.useApp();
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error(error.message);
    } else {
      message.success('Logged out successfully');
      navigate('/');
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      onClick: () => navigate('/'),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="fixed z-20 w-full flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 h-16 sm:h-20">
        <div className="flex items-center overflow-hidden">
          <div 
            className="text-xl sm:text-2xl font-black mr-4 sm:mr-8 text-blue-600 cursor-pointer tracking-tighter whitespace-nowrap"
            onClick={() => navigate('/')}
          >
            Thái Store
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none min-w-[100px] sm:min-w-[200px] bg-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                type="text" 
                icon={<ShoppingOutlined />} 
                onClick={() => navigate('/')}
                className="hidden lg:flex items-center"
              >
                Quản lý sản phẩm
              </Button>
              <Button 
                danger 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className="rounded-full h-9 sm:h-10 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              icon={<LoginOutlined />} 
              onClick={() => navigate('/login')}
              className="rounded-full h-9 sm:h-10 px-4 sm:px-6 shadow-md shadow-blue-100"
            >
              <span className="hidden xs:inline">Admin Login</span>
              <span className="xs:hidden">Login</span>
            </Button>
          )}
        </div>
      </Header>
      <Content className="mt-16 sm:mt-20 p-3 sm:p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto">
          {!isSupabaseConfigured && (
            <Alert
              message="Cấu hình Supabase chưa hoàn tất"
              description={
                <div>
                  Vui lòng thiết lập <strong>VITE_SUPABASE_URL</strong> và <strong>VITE_SUPABASE_ANON_KEY</strong> trong menu <strong>Secrets</strong> để ứng dụng hoạt động.
                </div>
              }
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              className="mb-6 rounded-xl"
            />
          )}
          <Outlet context={{ session }} />
        </div>
      </Content>
      <Footer className="text-center text-gray-400 text-sm py-8">
        PhoneStore ©{new Date().getFullYear()} Created with Ant Design & Supabase
      </Footer>
    </Layout>
  );
};

export default MainLayout;
