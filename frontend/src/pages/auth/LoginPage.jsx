import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      Swal.fire({
        title: 'تنبيه',
        text: 'الرجاء إدخال اسم المستخدم وكلمة المرور',
        icon: 'warning',
        confirmButtonText: 'حسناً'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        identifier: identifier,
        password: password
      });

      const { user, access_token } = response.data.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      
      dispatch(loginSuccess({ 
        user, 
        role: user.role, 
        token: access_token 
      }));

      const roleRedirects = {
        super_admin: '/super',
        school_admin: '/admin',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent'
      };

      navigate(roleRedirects[user.role] || '/');
      
      Swal.fire({
        title: 'أهلاً بك مجدداً!',
        text: 'تم تسجيل الدخول بنجاح',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'خطأ في الدخول',
        text: error.response?.data?.message || 'تأكد من البريد الإلكتروني وكلمة المرور',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="position-absolute top-0 end-0 p-4">
        <div className="theme-toggle" onClick={toggleTheme}>
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </div>
      </div>
      
      <div className="card shadow-lg p-4 p-md-5 border-0" style={{ maxWidth: '480px', width: '90%' }}>
        <div className="text-center mb-5">
          <div className="bg-primary bg-opacity-10 d-inline-block p-4 rounded-circle mb-3">
            <h2 className="text-primary fw-bold mb-0">S</h2>
          </div>
          <h2 className="fw-bold mb-1">المدارس الذكية</h2>
          <p className="text-muted">نظام الإدارة التعليمي المتكامل</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label small fw-600 text-muted">اسم المستخدم أو البريد الإلكتروني</label>
            <div className="position-relative">
              <span className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input 
                type="text" 
                className="form-control pe-5" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="اسم المستخدم"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-600 text-muted">كلمة المرور</label>
            <div className="position-relative">
              <span className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input 
                type="password" 
                className="form-control pe-5" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label small text-muted" htmlFor="rememberMe">تذكرني</label>
            </div>
            <a href="#" className="text-decoration-none small text-primary fw-600">نسيت كلمة المرور؟</a>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <div className="mt-5 text-center">
          <p className="text-muted small mb-0">جميع الحقوق محفوظة &copy; 2024 نظام المدارس الذكية</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
