import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faIdBadge, faCamera, faLock } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  const getRoleName = (role) => {
     const roles = {
        super_admin: 'المدير العام',
        school_admin: 'مدير المدرسة',
        teacher: 'معلم',
        student: 'طالب',
        parent: 'ولي أمر'
     };
     return roles[role] || role;
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>الملف الشخصي</h2>
        <p className="mb-0 opacity-80 small">إدارة معلوماتك الشخصية وإعدادات الأمان الخاصة بحسابك</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
           <div className="card border-0 shadow-sm text-center p-4">
              <div className="position-relative d-inline-block mx-auto mb-3">
                 <div className="avatar-lg bg-primary bg-opacity-10 text-primary" style={{ width: 120, height: 120, fontSize: '3rem' }}>
                    {user?.name?.[0] || 'U'}
                 </div>
                 <button className="btn btn-primary btn-icon rounded-circle position-absolute bottom-0 end-0" style={{ width: 35, height: 35 }}>
                    <FontAwesomeIcon icon={faCamera} size="sm" />
                 </button>
              </div>
              <h4 className="fw-bold mb-1">{user?.name}</h4>
              <div className="badge bg-light text-primary mb-3">{getRoleName(user?.role)}</div>
              <p className="small text-muted mb-0">تاريخ الانضمام: 12 يناير 2024</p>
           </div>
        </div>

        <div className="col-lg-8">
           <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">المعلومات الشخصية</h6>
              </div>
              <div className="card-body">
                 <div className="row g-3">
                    <div className="col-md-6">
                       <label className="form-label text-muted x-small uppercase">الاسم الكامل</label>
                       <div className="p-3 bg-light rounded-3 fw-bold">{user?.name}</div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label text-muted x-small uppercase">البريد الإلكتروني</label>
                       <div className="p-3 bg-light rounded-3 fw-bold">{user?.email}</div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label text-muted x-small uppercase">رقم الهاتف</label>
                       <div className="p-3 bg-light rounded-3 fw-bold">0777XXXXXX</div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label text-muted x-small uppercase">رقم الهوية / الأكاديمي</label>
                       <div className="p-3 bg-light rounded-3 fw-bold">#{user?.id}</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">تغيير كلمة المرور</h6>
              </div>
              <div className="card-body">
                 <div className="row g-3">
                    <div className="col-md-4">
                       <label className="form-label small">كلمة المرور الحالية</label>
                       <input type="password" password="true" className="form-control" />
                    </div>
                    <div className="col-md-4">
                       <label className="form-label small">كلمة المرور الجديدة</label>
                       <input type="password" password="true" className="form-control" />
                    </div>
                    <div className="col-md-4">
                       <label className="form-label small">تأكيد كلمة المرور</label>
                       <input type="password" password="true" className="form-control" />
                    </div>
                 </div>
                 <button className="btn btn-primary mt-4 px-4 py-2">
                    <FontAwesomeIcon icon={faLock} className="me-2" /> تحديث كلمة المرور
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
