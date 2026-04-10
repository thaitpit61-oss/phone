import React, { useState, useEffect } from 'react';
import { Layout, Button, App, Alert } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  LoginOutlined, 
  LogoutOutlined, 
  WarningOutlined,
  UserOutlined,
  SearchOutlined,
  HeartOutlined
} from '@ant-design/icons';
import type { Session } from '@supabase/supabase-js';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const { message } = App.useApp();
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <Layout className="min-h-screen bg-white">
      {/* Desktop Header */}
      <Header className="hidden sm:flex sticky top-0 z-50 w-full items-center justify-between bg-white/80 backdrop-blur-xl border-b border-border px-8 h-20">
        <div className="flex items-center gap-12">
          <div 
            className="text-2xl font-black text-primary cursor-pointer tracking-tighter"
            onClick={() => navigate('/')}
          >
            THÁI STORE
          </div>
          <nav className="flex items-center gap-8">
            <button 
              onClick={() => navigate('/')}
              className={`text-sm font-bold tracking-tight transition-colors ${isActive('/') ? 'text-primary' : 'text-text-muted hover:text-text'}`}
            >
              CỬA HÀNG
            </button>
            <button 
              className="text-sm font-bold tracking-tight text-text-muted hover:text-text transition-colors"
            >
              KHUYẾN MÃI
            </button>
            <button 
              className="text-sm font-bold tracking-tight text-text-muted hover:text-text transition-colors"
            >
              HỖ TRỢ
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<SearchOutlined className="text-xl" />} 
            className="rounded-full w-10 h-10 flex items-center justify-center"
          />
          {session ? (
            <div className="flex items-center gap-4">
              <Button 
                type="text" 
                icon={<UserOutlined className="text-xl" />} 
                onClick={() => navigate('/')}
                className="rounded-full w-10 h-10 flex items-center justify-center"
              />
              <Button 
                danger 
                type="text"
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className="font-bold"
              >
                ĐĂNG XUẤT
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              icon={<LoginOutlined />} 
              onClick={() => navigate('/login')}
              className="rounded-full px-8"
            >
              ADMIN
            </Button>
          )}
        </div>
      </Header>

      {/* Mobile Header */}
      <Header className="sm:hidden sticky top-0 z-50 w-full flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-border px-4 h-16">
        <div 
          className="text-xl font-black text-primary cursor-pointer tracking-tighter"
          onClick={() => navigate('/')}
        >
          THÁI STORE
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="text" 
            icon={<SearchOutlined className="text-lg" />} 
            className="rounded-full w-8 h-8 flex items-center justify-center"
          />
          {!session && (
            <Button 
              type="text" 
              icon={<LoginOutlined className="text-lg" />} 
              onClick={() => navigate('/login')}
              className="rounded-full w-8 h-8 flex items-center justify-center"
            />
          )}
        </div>
      </Header>

      <Content className="pb-24 sm:pb-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          {!isSupabaseConfigured && (
            <Alert
              message="Cấu hình Supabase chưa hoàn tất"
              description="Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong menu Secrets."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              className="mb-8 rounded-2xl"
            />
          )}
          <Outlet context={{ session }} />
        </div>
      </Content>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border px-4 pb-safe">
        <div className="flex items-center justify-around h-16">
          <button 
            onClick={() => navigate('/')}
            className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <HomeOutlined className="text-xl" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Trang chủ</span>
          </button>
          <button className="bottom-nav-item">
            <ShoppingOutlined className="text-xl" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Giỏ hàng</span>
          </button>
          <button className="bottom-nav-item">
            <HeartOutlined className="text-xl" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Yêu thích</span>
          </button>
          <button 
            onClick={() => session ? handleLogout() : navigate('/login')}
            className="bottom-nav-item"
          >
            {session ? <LogoutOutlined className="text-xl" /> : <UserOutlined className="text-xl" />}
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {session ? 'Đăng xuất' : 'Tài khoản'}
            </span>
          </button>
        </div>
      </div>

      <Footer className="hidden sm:block text-center text-text-muted text-xs py-12 bg-surface border-t border-border">
        THÁI STORE ©{new Date().getFullYear()} • MODERN MOBILE SOLUTIONS
      </Footer>
    </Layout>
  );
};

export default MainLayout;
