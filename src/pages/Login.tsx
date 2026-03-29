import React from 'react';
import { Form, Input, Button, Card as AntdCard, App, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;
const Card: any = AntdCard;

const Login: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    if (!isSupabaseConfigured) {
      message.warning('Vui lòng cấu hình Supabase trước khi đăng nhập.');
      return;
    }
    setLoading(true);
    const { email, password } = values;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      message.error('Sai tài khoản hoặc mật khẩu!');
    } else {
      message.success('Đăng nhập thành công!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-none">
        <div className="text-center mb-8">
          <Title level={2}>Chào mừng trở lại</Title>
          <p className="text-gray-400">Vui lòng đăng nhập để quản lý cửa hàng</p>
        </div>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined className="text-gray-300" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full h-12 rounded-lg font-semibold" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
