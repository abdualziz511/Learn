import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSearch, faUserGraduate, faIdCard, faMapMarkerAlt,
  faPhone, faGraduationCap, faEdit, faTrash, faFilter,
  faCircleCheck, faUserShield, faVenusMars, faUsers, faInfoCircle,
  faMars, faVenus, faEye, faEnvelope, faCalendarAlt, faHome, faFingerprint
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', academic_year_id: 1, grade_level_id: '',
    class_id: '', student_code: '', parent_phone: '',
    gender: 'male', address: '', email: '', password: 'password'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sRes, gRes, cRes] = await Promise.all([
        axiosInstance.get('/school-admin/students'),
        axiosInstance.get('/school-admin/grade-levels'),
        axiosInstance.get('/school-admin/classes')
      ]);
      setStudents(sRes.data?.data || []);
      setGradeLevels(gRes.data?.data || []);
      setClasses(cRes.data?.data || []);
    } catch (e) { 
      console.error(e);
      Swal.fire('خطأ', 'فشل في جلب بيانات الطلاب', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
    if (name === 'grade_level_id') {
      setFormData(prev => ({ ...prev, class_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosInstance.put(`/school-admin/students/${selectedId}`, formData);
      } else {
        await axiosInstance.post('/school-admin/students', formData);
      }
      setShowModal(false);
      resetForm();
      fetchInitialData();
      Swal.fire({ title: 'تمت العملية', text: isEdit ? 'تم تحديث البيانات' : 'تم التسجيل بنجاح', icon: 'success', confirmButtonColor: '#7367f0' });
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل في العملية', 'error');
    }
  };

  const handleEdit = (s) => {
    setIsEdit(true);
    setSelectedId(s.id);
    setFormData({
      name: s.student_name || s.name || '',
      academic_year_id: s.academic_year_id || 1,
      grade_level_id: s.grade_level_id || '',
      class_id: s.class_id || '',
      student_code: s.student_code || '',
      parent_phone: s.parent_phone || '',
      gender: s.gender || 'male',
      address: s.address || '',
      email: s.email || '',
      password: ''
    });
    setShowModal(true);
  };

  const handlePreview = (s) => {
    const genderIcon = s.gender === 'male' ? 'fa-mars' : 'fa-venus';
    const genderColor = s.gender === 'male' ? '#00cfe8' : '#ff9f43';
    const sName = s.student_name || s.name || '?';

    Swal.fire({
      html: `
        <div class="student-profile-deluxe text-end" style="font-family: 'Cairo', sans-serif; direction: rtl;">
          <div class="profile-header mb-4 p-4 rounded-4 shadow-sm text-center text-white" style="background: linear-gradient(135deg, #7367f0 0%, #8e85f1 100%);">
            <div class="avatar-wrapper mb-3 position-relative d-inline-block">
               <div class="rounded-circle bg-white shadow-lg d-flex align-items-center justify-content-center mx-auto" style="width: 90px; height: 90px; border: 3px solid rgba(255,255,255,0.3);">
                  <span style="font-size: 36px; font-weight: 900; color: #7367f0;">${sName[0]}</span>
               </div>
               <span class="position-absolute bottom-0 end-0 badge rounded-circle p-2 shadow-sm border border-white border-2" style="background-color: ${genderColor};">
                  <i class="fas ${genderIcon} text-white x-small"></i>
               </span>
            </div>
            <h4 class="fw-900 mb-1">${sName}</h4>
            <div class="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 x-small">كود: ${s.student_code}</div>
          </div>

          <div class="profile-content px-1">
             <div class="row g-3">
                <div class="col-6">
                   <div class="info-card p-3 rounded-4 bg-light border-0 shadow-xs">
                      <div class="text-muted x-small mb-1"><i class="fas fa-graduation-cap ms-1 text-primary"></i> الصف الدراسي</div>
                      <div class="fw-bold text-dark small">${s.grade_level_name || s.grade_name || 'غير محدد'}</div>
                   </div>
                </div>
                <div class="col-6">
                   <div class="info-card p-3 rounded-4 bg-light border-0 shadow-xs">
                      <div class="text-muted x-small mb-1"><i class="fas fa-users ms-1 text-primary"></i> الشعبة / الفصل</div>
                      <div class="fw-bold text-dark small">${s.class_name || 'غير محدد'}</div>
                   </div>
                </div>
                
                <div class="col-12 mt-3">
                   <h6 class="fw-bold mb-2 ps-2" style="font-size: 12px; color: #7367f0;">معلومات الاتصال</h6>
                   <div class="list-group list-group-flush rounded-4 overflow-hidden border shadow-sm">
                      <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
                         <span class="text-muted small"><i class="fas fa-phone-alt ms-2 opacity-50"></i>هاتف ولي الأمر</span>
                         <span class="fw-bold text-dark font-monospace">${s.parent_phone || '---'}</span>
                      </div>
                      <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
                         <span class="text-muted small"><i class="fas fa-envelope ms-2 opacity-50"></i>البريد الإلكتروني</span>
                         <span class="small text-dark font-monospace">${s.email || 'غير مسجل'}</span>
                      </div>
                      <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                         <span class="text-muted small"><i class="fas fa-map-marker-alt ms-2 opacity-50"></i>العنوان</span>
                         <span class="small text-dark">${s.address || 'غير متوفر'}</span>
                      </div>
                   </div>
                </div>

                <div class="col-12 mt-4">
                   <div class="d-flex align-items-center gap-2 alert-primary-soft p-3 rounded-4 x-small" style="background-color: #7367f010; color: #7367f0;">
                      <i class="fas fa-calendar-check ms-1"></i> تاريخ تسجيل الملف: <strong>${new Date().toLocaleDateString('ar-EG')}</strong>
                   </div>
                </div>
             </div>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '460px',
      customClass: { 
        popup: 'rounded-5 border-0 shadow-2xl p-0 overflow-hidden',
        closeButton: 'bg-white rounded-circle shadow-sm p-2 m-2 h-auto text-muted'
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف بيانات الطالب نهائياً من النظام!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea5455',
      cancelButtonColor: '#7367f0',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/school-admin/students/${id}`);
          fetchInitialData();
          Swal.fire({ title: 'تم الحذف', text: 'تم المسح بنجاح', icon: 'success', confirmButtonColor: '#7367f0' });
        } catch (err) {
          Swal.fire('خطأ', 'فشل الحذف', 'error');
        }
      }
    });
  };

  const resetForm = () => {
    setIsEdit(false);
    setSelectedId(null);
    setFormData({
      name: '', academic_year_id: 1, grade_level_id: '',
      class_id: '', student_code: '', parent_phone: '',
      gender: 'male', address: '', email: '', password: 'password'
    });
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (s.student_code || '').includes(searchTerm);
    const matchGrade = filterGrade === '' || s.grade_level_id == filterGrade;
    const matchClass = filterClass === '' || s.class_id == filterClass;
    return matchSearch && matchGrade && matchClass;
  });

  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;

  return (
    <div className="animate__animated animate__fadeIn">
      <style>
        {`
          .bg-primary { background-color: #7367f0 !important; }
          .text-primary { color: #7367f0 !important; }
          .btn-primary { background-color: #7367f0 !important; border-color: #7367f0 !important; }
          .bg-primary-soft { background-color: #7367f015 !important; }
          .bg-male-soft { background-color: #00cfe815 !important; color: #00cfe8 !important; }
          .bg-female-soft { background-color: #ff9f4315 !important; color: #ff9f43 !important; }
          .btn-primary-soft { background-color: #7367f015 !important; color: #7367f0 !important; border: none !important; }
          .btn-warning-soft { background-color: #ff9f4315 !important; color: #ff9f43 !important; border: none !important; }
          .btn-danger-soft { background-color: #ea545515 !important; color: #ea5455 !important; border: none !important; }
          .rounded-5 { border-radius: 1.5rem !important; }
          .x-small { font-size: 11px; }
          .fw-900 { font-weight: 900; }
          .hover-shadow:hover { transform: translateY(-5px); transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          .avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        `}
      </style>

      {/* Hero */}
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>شئون الطلاب</h2>
            <p className="mb-0 opacity-80 small">إدارة ملفات الطلاب وتصنيفهم الأكاديمي والسكني</p>
          </div>
          <button className="btn btn-white text-primary fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={() => { resetForm(); setShowModal(true); }}>
             <FontAwesomeIcon icon={faPlus} className="ms-2" /> تسجيل طالب جديد
          </button>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4 text-end" style={{ direction: 'rtl' }}>
        <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100"><div className="d-flex align-items-center justify-content-between"><div className="bg-primary-soft text-primary rounded-circle p-3"><FontAwesomeIcon icon={faUserGraduate} /></div><div><div className="text-muted x-small">إجمالي الطلاب</div><div className="fw-900 h5 mb-0 text-dark">{students.length}</div></div></div></div></div>
        <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100"><div className="d-flex align-items-center justify-content-between"><div className="bg-male-soft rounded-circle p-3"><FontAwesomeIcon icon={faMars} /></div><div><div className="text-muted x-small">عدد البنين</div><div className="fw-900 h5 mb-0 text-dark">{maleCount}</div></div></div></div></div>
        <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100"><div className="d-flex align-items-center justify-content-between"><div className="bg-female-soft rounded-circle p-3"><FontAwesomeIcon icon={faVenus} /></div><div><div className="text-muted x-small">عدد البنات</div><div className="fw-900 h5 mb-0 text-dark">{femaleCount}</div></div></div></div></div>
        <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100 bg-primary text-white"><div className="d-flex align-items-center justify-content-between"><div className="bg-white bg-opacity-20 rounded-circle p-3"><FontAwesomeIcon icon={faUsers} /></div><div><div className="opacity-75 x-small">إجمالي الصفوف</div><div className="fw-bold h6 mb-0">{gradeLevels.length} صف دراسي</div></div></div></div></div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center text-end" style={{ direction: 'rtl' }}>
          <div className="col-md-4"><div className="input-group"><span className="input-group-text bg-light border-0 px-3"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span><input type="text" className="form-control border-0 bg-light py-2 px-3 shadow-none text-end" placeholder="ابحث باسم الطالب أو الرقم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
          <div className="col-md-3"><select className="form-select border-0 bg-light py-2 shadow-none text-end" value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); setFilterClass(''); }}><option value="">جميع الصفوف</option>{gradeLevels.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="col-md-3"><select className="form-select border-0 bg-light py-2 shadow-none text-end" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} disabled={!filterGrade}><option value="">جميع الشعب</option>{classes.filter(c => c.grade_level_id == filterGrade).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
          <div className="col-md-2 text-start"><button className="btn btn-primary-soft rounded-pill px-3 border-0 w-100 h-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={fetchInitialData}><FontAwesomeIcon icon={faInfoCircle} /><span className="small fw-bold">تحديث</span></button></div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeInUp">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-end" style={{ fontSize: '13px', direction: 'rtl' }}>
            <thead className="bg-primary text-white">
              <tr>
                <th className="pr-4 py-3 border-0 fw-bold px-4 text-white">الطالب</th>
                <th className="py-3 border-0 fw-bold text-white">الصف / الشعبة</th>
                <th className="py-3 border-0 fw-bold text-white">ولي الأمر</th>
                <th className="py-3 border-0 fw-bold text-white">الجنس</th>
                <th className="text-center border-0 fw-bold px-4 text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary opacity-50"></div></td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="border-bottom-soft transition-all">
                    <td className="pr-4 py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div className={`avatar ${s.gender === 'male' ? 'bg-male-soft' : 'bg-female-soft'} ml-2 ms-2`}>{s.student_name ? s.student_name[0] : (s.name ? s.name[0] : '?')}</div>
                        <div className="text-start"><div className="fw-bold text-dark">{s.student_name || s.name}</div><div className="x-small text-muted"><FontAwesomeIcon icon={faIdCard} className="me-1 x-small" /> {s.student_code}</div></div>
                      </div>
                    </td>
                    <td><div className="d-flex flex-column"><span className="fw-bold text-primary">{s.grade_level_name || s.grade_name}</span><span className="x-small text-muted">{s.class_name || '--'}</span></div></td>
                    <td><div className="d-flex flex-column"><span className="small text-dark font-monospace">{s.parent_phone || 'لا يوجد'}</span><span className="x-small text-muted">ولي الأمر</span></div></td>
                    <td><span className={`badge rounded-pill px-3 py-2 ${s.gender === 'male' ? 'bg-male-soft' : 'bg-female-soft'}`} style={{ fontSize: '10px' }}><FontAwesomeIcon icon={s.gender === 'male' ? faMars : faVenus} className="me-1" /> {s.gender === 'male' ? 'ذكر' : 'أنثى'}</span></td>
                    <td className="text-center px-4"><div className="d-flex justify-content-center gap-2"><button className="btn btn-primary-soft btn-sm rounded-circle" title="معاينة" onClick={() => handlePreview(s)}><FontAwesomeIcon icon={faEye} /></button><button className="btn btn-warning-soft btn-sm rounded-circle" title="تعديل" onClick={() => handleEdit(s)}><FontAwesomeIcon icon={faEdit} /></button><button className="btn btn-danger-soft btn-sm rounded-circle" title="حذف" onClick={() => handleDelete(s.id)}><FontAwesomeIcon icon={faTrash} /></button></div></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">لا يوجد طلاب مطابقون لمعايير الفلترة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(115, 103, 240, 0.15)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl rounded-5 overflow-hidden bg-white">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div className="d-flex align-items-center"><div className="bg-white text-primary rounded-3 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}><FontAwesomeIcon icon={faUserGraduate} /></div><h5 className="modal-title fw-bold m-0">{isEdit ? 'تعديل بيانات طالب' : 'تسجيل طالب جديد'}</h5></div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 bg-light bg-opacity-50" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  <div className="row g-3" style={{ direction: 'rtl' }}>
                    <div className="col-12 mb-2 text-end"><span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill x-small fw-bold">1. البيانات الشخصية</span></div>
                    <div className="col-md-6 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">اسم الطالب الرباعي</label><input type="text" name="name" className="form-control border-0 shadow-sm py-2 rounded-3 text-end" required value={formData.name} onChange={handleInputChange} /></div>
                    <div className="col-md-3 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">كود الطالب</label><input type="text" name="student_code" className="form-control border-0 shadow-sm py-2 rounded-3 text-end font-monospace" required value={formData.student_code} onChange={handleInputChange} /></div>
                    <div className="col-md-3 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">الجنس</label><select name="gender" className="form-select border-0 shadow-sm py-2 rounded-3 text-end" value={formData.gender} onChange={handleInputChange}><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
                    <div className="col-12 mt-3 pt-3 border-top text-end"><span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill x-small fw-bold">2. الإدارة الأكاديمية</span></div>
                    <div className="col-md-6 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">الصف الدراسي</label><select name="grade_level_id" className="form-select border-0 shadow-sm py-2 rounded-3 text-end" required value={formData.grade_level_id} onChange={handleInputChange}><option value="">اختر الصف...</option>{gradeLevels.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                    <div className="col-md-6 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">الفصل / الشعبة</label><select name="class_id" className="form-select border-0 shadow-sm py-2 rounded-3 text-end" required value={formData.class_id} onChange={handleInputChange} disabled={!formData.grade_level_id}><option value="">اختر الشعبة...</option>{classes.filter(c => c.grade_level_id == formData.grade_level_id).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                    <div className="col-md-6 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">هاتف ولي الأمر</label><input type="text" name="parent_phone" className="form-control border-0 shadow-sm py-2 rounded-3 text-end" required value={formData.parent_phone} onChange={handleInputChange} placeholder="7xxxxxxxx" /></div>
                    <div className="col-md-6 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">البريد الإلكتروني</label><input type="email" name="email" className="form-control border-0 shadow-sm py-2 rounded-3 text-end font-monospace" value={formData.email} onChange={handleInputChange} /></div>
                    {!isEdit && (<div className="col-12 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">كلمة المرور</label><input type="password" name="password" className="form-control border-0 shadow-sm py-2 rounded-3 text-end" value={formData.password} onChange={handleInputChange} /></div>)}
                    <div className="col-12 text-end"><label className="x-small fw-bold text-muted mb-1 ps-2">عنوان السكن</label><textarea name="address" className="form-control border-0 shadow-sm py-2 rounded-3 text-end" rows="2" value={formData.address} onChange={handleInputChange}></textarea></div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 bg-white shadow-lg"><button type="button" className="btn btn-light rounded-pill px-4 fw-bold text-muted border-0" onClick={() => setShowModal(false)}>إلغاء</button><button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-lg border-0">{isEdit ? 'تحديث البيانات' : 'إتمام التسجيل'}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageStudents;
