import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBuilding, faImage, faMapMarkerAlt, faPhone, faEnvelope, faGlobe, faHistory } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageSchoolProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState({
    name: '', name_en: '', email: '', phone: '',
    address: '', city: '', website: '', founded_year: '',
    logo: ''
  });

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      const res = await axiosInstance.get('/school-admin/school');
      setSchool(res.data?.data || {});
    } catch (e) {
      console.error(e);
      Swal.fire('خطأ', 'فشل في تحميل بيانات المدرسة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/school-admin/school', school);
      Swal.fire({
        title: 'تم التحديث',
        text: 'تم حفظ بيانات المدرسة بنجاح',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      console.error(e);
      Swal.fire('خطأ', 'فشل في تحديث البيانات', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-primary"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>إدارة بيانات المدرسة</h2>
            <p className="mb-0 opacity-80 small">تحديث المعلومات الأساسية، الشعار، وبيانات التواصل</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
            <FontAwesomeIcon icon={faBuilding} size="xl" />
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-4">
             <div className="card border-0 shadow-sm text-center p-4">
                <div className="mb-4">
                   <div style={{ width: 150, height: 150, borderRadius: '24px', background: 'var(--bg-body)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed var(--border-color)' }}>
                      {school.logo ? (
                         <img src={school.logo} alt="School Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                         <FontAwesomeIcon icon={faImage} size="3x" className="text-muted opacity-30" />
                      )}
                   </div>
                </div>
                <button type="button" className="btn btn-sm btn-outline-primary w-100 mb-2">تغيير الشعار</button>
                <p className="small text-muted mb-0">يفضل صورة مربعة (512x512) بصيغة PNG أو JPG</p>
                
                <div className="divider my-4"></div>
                
                <div className="text-start">
                   <div className="small fw-bold text-muted mb-2">معلومات النظام</div>
                   <div className="d-flex justify-content-between small mb-2">
                      <span>تاريخ الانضمام:</span>
                      <span className="fw-bold">{new Date(school.created_at).toLocaleDateString('ar')}</span>
                   </div>
                   <div className="d-flex justify-content-between small">
                      <span>حالة الحساب:</span>
                      <span className="badge badge-active">نشط</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="col-lg-8">
             <div className="card border-0 shadow-sm p-4">
                <div className="row g-3">
                   <div className="col-md-6 text-start">
                      <label className="form-label fw-bold small">اسم المدرسة (بالعربية)</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faBuilding} className="text-primary" /></span>
                         <input type="text" name="name" className="form-control bg-light border-0" value={school.name} onChange={handleChange} required />
                      </div>
                   </div>
                   <div className="col-md-6">
                      <label className="form-label fw-bold small text-start d-block">اسم المدرسة (بالإنجليزية)</label>
                      <input type="text" name="name_en" className="form-control bg-light border-0" value={school.name_en} onChange={handleChange} dir="ltr" />
                   </div>
                   
                   <div className="col-md-6">
                      <label className="form-label fw-bold small text-start d-block">البريد الإلكتروني الرسمي</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faEnvelope} className="text-info" /></span>
                         <input type="email" name="email" className="form-control bg-light border-0" value={school.email} onChange={handleChange} dir="ltr" />
                      </div>
                   </div>
                   <div className="col-md-6">
                      <label className="form-label fw-bold small text-start d-block">رقم الهاتف</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faPhone} className="text-success" /></span>
                         <input type="text" name="phone" className="form-control bg-light border-0" value={school.phone} onChange={handleChange} />
                      </div>
                   </div>

                   <div className="col-md-6">
                      <label className="form-label fw-bold small text-start d-block">المدينة</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger" /></span>
                         <input type="text" name="city" className="form-control bg-light border-0" value={school.city} onChange={handleChange} />
                      </div>
                   </div>
                   <div className="col-md-6">
                      <label className="form-label fw-bold small text-start d-block">سنة التأسيس</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faHistory} className="text-warning" /></span>
                         <input type="number" name="founded_year" className="form-control bg-light border-0" value={school.founded_year} onChange={handleChange} min="1900" max="2100" />
                      </div>
                   </div>

                   <div className="col-12">
                      <label className="form-label fw-bold small text-start d-block">العنوان الكامل</label>
                      <textarea name="address" rows="2" className="form-control bg-light border-0" value={school.address} onChange={handleChange}></textarea>
                   </div>
                   
                   <div className="col-12">
                      <label className="form-label fw-bold small text-start d-block">رابط الموقع الإلكتروني</label>
                      <div className="input-group">
                         <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faGlobe} className="text-primary" /></span>
                         <input type="url" name="website" className="form-control bg-light border-0" value={school.website} onChange={handleChange} dir="ltr" placeholder="https://..." />
                      </div>
                   </div>
                </div>

                <div className="divider my-4"></div>
                
                <div className="d-flex justify-content-end">
                   <button type="submit" className="btn btn-primary px-5 py-3 d-flex align-items-center gap-2" disabled={saving}>
                      {saving ? <div className="spinner-border spinner-border-sm"></div> : <FontAwesomeIcon icon={faSave} />}
                      <span>حفظ كافة التغييرات</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageSchoolProfile;
