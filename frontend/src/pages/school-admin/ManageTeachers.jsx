import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardTeacher, faPlus, faSearch, faEdit, faTrash,
  faEnvelope, faPhone, faGraduationCap, faCircleCheck, faBook,
  faEye, faUserTie, faIdCard, faCalendar, faTimes
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageTeachers = () => {
  // Define the custom primary color from the image
  const primaryColor = '#7367f0';
  const softPrimary = '#7367f015'; // 15% opacity

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', teacher_code: '',
    qualification: '', hire_date: new Date().toISOString().split('T')[0],
    password: 'password',
    assignments: [{ grade_level_id: '', class_id: '', subject_id: '' }]
  });

  useEffect(() => {
    fetchTeachers();
    fetchMetadata();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/school-admin/teachers');
      setTeachers(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchMetadata = async () => {
    try {
      console.log('Fetching classes...');
      const clsRes = await axiosInstance.get('/school-admin/classes');
      setClasses(clsRes.data?.data || []);

      console.log('Fetching subjects...');
      const subRes = await axiosInstance.get('/school-admin/subjects');
      setSubjects(subRes.data?.data || []);

      console.log('Fetching grade-levels...');
      const gradeRes = await axiosInstance.get('/school-admin/grade-levels');
      setGradeLevels(gradeRes.data?.data || []);

      console.log('Metadata fetched successfully');
    } catch (e) {
      console.error('Metadata Fetch Error Details:', e.response?.data || e.message);
      Swal.fire('خطأ في التحميل', 'فشل جلب البيانات الأساسية من الخادم: ' + (e.response?.data?.message || e.message), 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handeAssignmentChange = (index, field, value) => {
    const newAsn = [...formData.assignments];
    newAsn[index][field] = value;

    // If grade level changed, reset class and subject
    if (field === 'grade_level_id') {
      newAsn[index].class_id = '';
      newAsn[index].subject_id = '';
    }

    setFormData(prev => ({ ...prev, assignments: newAsn }));
  };

  const addAssignmentRow = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { grade_level_id: '', class_id: '', subject_id: '' }]
    }));
  };

  const removeAssignmentRow = (index) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }));
  };

  const handleShowAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (t) => {
    setIsEdit(true);
    setSelectedId(t.id);
    setFormData({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      specialization: t.specialization || '',
      teacher_code: t.teacher_code || '',
      qualification: t.qualification || '',
      hire_date: t.hire_date || new Date().toISOString().split('T')[0],
      password: '',
      assignments: t.assignments?.length > 0
        ? t.assignments.map(a => ({
          grade_level_id: a.grade_level_id || '',
          class_id: a.class_id || '',
          subject_id: a.subject_id || ''
        }))
        : [{ grade_level_id: '', class_id: '', subject_id: '' }]
    });
    setShowModal(true);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty assignments before sending
      const validAssignments = formData.assignments.filter(a => a.grade_level_id && a.class_id && a.subject_id);
      const payload = { ...formData, assignments: validAssignments };

      if (isEdit) {
        await axiosInstance.put(`/school-admin/teachers/${selectedId}`, payload);
      } else {
        await axiosInstance.post('/school-admin/teachers', payload);
      }

      setShowModal(false);
      resetForm();
      fetchTeachers();
      Swal.fire({
        title: 'تم بنجاح',
        text: isEdit ? 'تم تحديث بيانات المعلم بنجاح' : 'تم إضافة المعلم وحفظ المهام بنجاح',
        icon: 'success',
        confirmButtonText: 'ممتاز',
      });
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل في العملية', 'error');
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setSelectedId(null);
    setFormData({
      name: '', email: '', phone: '', specialization: '', teacher_code: '',
      qualification: '', hire_date: new Date().toISOString().split('T')[0],
      password: 'password',
      assignments: [{ grade_level_id: '', class_id: '', subject_id: '' }]
    });
  };

  const handleDelete = (t) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم إزالة المعلم ${t.name} من سجلات هذه المدرسة نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // In this system, deleting a teacher from school admin means removing all their assignments in this school
          await axiosInstance.delete(`/school-admin/teachers/${t.id}?action=all`);
          fetchTeachers();
          Swal.fire('تم الحذف!', 'تمت إزالة المعلم بنجاح.', 'success');
        } catch (err) {
          Swal.fire('خطأ', 'فشل في عملية الحذف', 'error');
        }
      }
    });
  };

  const handleViewTeacher = (t) => {
    Swal.fire({
      html: `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; font-size: 13px;">
          <!-- Header Banner -->
          <div class="position-relative overflow-hidden rounded-top-4 bg-primary p-4 mb-4" style="margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
            <div class="position-relative z-1 d-flex align-items-center gap-3">
              <div class="bg-white text-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold" style="width: 55px; height: 55px; font-size: 22px;">
                ${t.name[0]}
              </div>
              <div class="text-white">
                <h6 class="fw-bold mb-0">${t.name}</h6>
                <div class="opacity-75 small"><i class="fas fa-tag me-1 text-white-50"></i>${t.teacher_code || 'T-' + t.id}</div>
              </div>
            </div>
            <div class="position-absolute end-0 top-0 h-100 w-50 bg-white opacity-10" style="transform: skewX(-25deg) translateX(30%)"></div>
          </div>

          <div class="px-2">
            <!-- Grid Info -->
            <div class="row g-2 mb-4">
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 border-0 h-100">
                  <div class="text-muted x-small mb-1">التخصص</div>
                  <div class="fw-bold text-dark"><i class="fas fa-microscope me-2 text-primary opacity-50"></i>${t.specialization || 'غير محدد'}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 border-0 h-100">
                  <div class="text-muted x-small mb-1">الهاتف</div>
                  <div class="fw-bold text-dark"><i class="fas fa-phone-alt me-2 text-primary opacity-50"></i>${t.phone || 'غير مدرج'}</div>
                </div>
              </div>
              <div class="col-12">
                <div class="p-3 bg-light rounded-4 border-0">
                  <div class="text-muted x-small mb-1">البريد الإلكتروني</div>
                  <div class="fw-bold text-dark"><i class="fas fa-envelope me-2 text-primary opacity-50"></i>${t.email || '-'}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 border-0">
                  <div class="text-muted x-small mb-1">المؤهل</div>
                  <div class="fw-bold text-dark"><i class="fas fa-graduation-cap me-2 text-primary opacity-50"></i>${t.qualification || '-'}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 border-0">
                  <div class="text-muted x-small mb-1">تاريخ التعيين</div>
                  <div class="fw-bold text-dark"><i class="fas fa-calendar-alt me-2 text-primary opacity-50"></i>${t.hire_date || '-'}</div>
                </div>
              </div>
            </div>

            <!-- Professional Section -->
            <div class="mb-2 fw-bold text-primary small d-flex align-items-center gap-2">
              <span class="bg-primary rounded-pill" style="width:10px; height:2px;"></span>
              المهام والأنصبة الدراسية
            </div>
            
            ${t.assignments?.length > 0 ? `
              <div class="bg-white border rounded-4 overflow-hidden shadow-sm">
                <table class="table table-sm table-borderless mb-0 x-small align-middle">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-3 py-2 text-muted">المادة</th>
                      <th class="py-2 text-muted text-center">الصف</th>
                      <th class="pe-3 py-2 text-muted text-start">الشعبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${t.assignments.map(a => `
                      <tr class="border-top-soft">
                        <td class="ps-3 py-2"><span class="fw-bold text-primary">${a.subject_name}</span></td>
                        <td class="py-2 text-center text-muted">${a.grade_level_name || '-'}</td>
                        <td class="pe-3 py-2 text-start"><span class="badge bg-primary-soft text-primary rounded-pill px-3">${a.class_name}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="p-4 bg-light rounded-4 text-center text-muted small border-1 border-dashed">
                <i class="fas fa-info-circle mb-2 d-block fa-2x opacity-20"></i>
                لا توجد مهام دراسية مسندة حالياً
              </div>
            `}
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '460px',
      customClass: {
        popup: 'rounded-5 border-0 shadow-2xl p-0 overflow-hidden',
        closeButton: 'bg-white rounded-circle shadow-sm p-2 m-2 h-auto'
      }
    });
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacher_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Dynamic Purple Theme Injection */}
      <style>
        {`
          .bg-primary { background-color: #7367f0 !important; }
          .text-primary { color: #7367f0 !important; }
          .btn-primary { background-color: #7367f0 !important; border-color: #7367f0 !important; }
          .btn-outline-primary { color: #7367f0 !important; border-color: #7367f0 !important; }
          .btn-primary-soft { background-color: #7367f015 !important; color: #7367f0 !important; border: none !important; }
          .bg-primary-soft { background-color: #7367f015 !important; }
          .border-primary { border-color: #7367f0 !important; }
          .stat-icon-box.bg-primary { background-color: #7367f0 !important; }
          .hover-bg-light:hover { background-color: #7367f008 !important; }
          .form-control:focus, .form-select:focus { border-color: #7367f0 !important; box-shadow: 0 0 0 0.25rem #7367f025 !important; }
        `}
      </style>

      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>إدارة هيئة التدريس</h2>
            <p className="mb-0 opacity-80 small">تنظيم الكادر التعليمي وإدارتهم بذكاء</p>
          </div>
          <button className="btn btn-white text-primary border-0 fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={handleShowAddModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> إضافة معلم جديد
          </button>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-3 bg-light bg-opacity-50">
          <div className="input-group">
            <span className="input-group-text bg-white border-0 ps-3"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
            <input
              type="text"
              className="form-control border-0 py-2 shadow-none"
              placeholder="ابحث عن معلم بالاسم، التخصص، أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="bg-primary text-white">
              <tr>
                <th className="ps-4 py-3 border-0 fw-bold text-white">اسم المعلم</th>
                <th className="py-3 border-0 fw-bold text-white">البيانات المهنية</th>
                <th className="py-3 border-0 fw-bold text-white">بيانات التواصل</th>
                <th className="py-3 border-0 fw-bold text-white">الحالة</th>
                <th className="text-center pe-4 border-0 fw-bold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary opacity-50"></div></td></tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="border-bottom-soft transition-all hover-bg-light">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-soft text-primary me-3 rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '42px', height: '42px', fontSize: '16px' }}>
                          {t.name[0]}
                        </div>
                        <div>
                          <div className="fw-bold text-dark mb-0">{t.name}</div>
                          <div className="x-small text-muted"><i className="fas fa-id-card-alt me-1"></i>{t.teacher_code || t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span className="text-dark fw-medium"><i className="fas fa-briefcase text-primary opacity-50 me-2"></i>{t.specialization || 'بدون تخصص'}</span>
                        <span className="x-small text-muted"><i className="fas fa-graduation-cap me-2"></i>{t.qualification || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="fw-bold text-primary x-small">
                          <FontAwesomeIcon icon={faPhone} className="me-2 opacity-75" />
                          {t.phone || 'غير مدرج'}
                        </div>
                        <div className="text-muted x-small">
                          <FontAwesomeIcon icon={faEnvelope} className="me-2 opacity-50" />
                          {t.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${t.is_active ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`} style={{ fontSize: '10px' }}>
                        {t.is_active ? '● نشط' : '● غير نشط'}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-primary-soft btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="معاينة" onClick={() => handleViewTeacher(t)}><FontAwesomeIcon icon={faEye} /></button>
                        <button className="btn btn-warning-soft btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="تعديل" onClick={() => handleEditClick(t)}><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="btn btn-danger-soft btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="حذف" onClick={() => handleDelete(t)}><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">لا يوجد معلمون مطابقون للبحث</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(13, 110, 253, 0.15)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl rounded-5 overflow-hidden bg-white">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-white text-primary rounded-3 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}><FontAwesomeIcon icon={faChalkboardTeacher} /></div>
                  <h5 className="modal-title fw-bold m-0">{isEdit ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد للنظام'}</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddTeacher}>
                <div className="modal-body p-4 bg-light bg-opacity-50" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-12 mb-2"><span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill x-small fw-bold">1. المعلومات الأساسية</span></div>

                    <div className="col-md-3">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">اسم المعلم</label>
                      <input type="text" name="name" className="form-control border-0 shadow-sm py-2 rounded-3" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">رقم الهاتف</label>
                      <input type="text" name="phone" className="form-control border-0 shadow-sm py-2 rounded-3" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">التخصص</label>
                      <input type="text" name="specialization" className="form-control border-0 shadow-sm py-2 rounded-3" required value={formData.specialization} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">الكود (اختياري)</label>
                      <input type="text" name="teacher_code" className="form-control border-0 shadow-sm py-2 rounded-3" value={formData.teacher_code} onChange={handleInputChange} placeholder="T-001" />
                    </div>

                    <div className="col-md-4">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">المؤهل العلمي</label>
                      <input type="text" name="qualification" className="form-control border-0 shadow-sm py-2 rounded-3" value={formData.qualification} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">تاريخ التعيين</label>
                      <input type="date" name="hire_date" className="form-control border-0 shadow-sm py-2 rounded-3" value={formData.hire_date} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="x-small fw-bold text-muted mb-1 ps-2">البريد الإلكتروني</label>
                      <input type="email" name="email" className="form-control border-0 shadow-sm py-2 rounded-3" required value={formData.email} onChange={handleInputChange} />
                    </div>

                    {!isEdit && (
                      <div className="col-12 mt-2">
                        <label className="x-small fw-bold text-muted mb-1 ps-2">كلمة المرور المؤقتة</label>
                        <input type="password" name="password" className="form-control border-0 shadow-sm py-2 rounded-3" value={formData.password} onChange={handleInputChange} />
                      </div>
                    )}

                    <div className="col-12 mt-4 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill x-small fw-bold">2. إسناد الأنصبة الدراسية</span>
                        <button type="button" className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-bold shadow-sm" style={{ fontSize: '11px' }} onClick={addAssignmentRow}>
                          <FontAwesomeIcon icon={faPlus} className="me-1" /> إضافة مهمة
                        </button>
                      </div>

                      <div className="assignment-rows">
                        {formData.assignments.map((asn, index) => (
                          <div key={index} className="row g-2 mb-2 bg-white p-3 rounded-4 shadow-sm border-0 position-relative animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="col-md-4">
                              <label className="x-small text-muted mb-1 d-block ms-1">الصف</label>
                              <select className="form-select border-0 bg-light x-small py-2 rounded-3" value={asn.grade_level_id} onChange={(e) => handeAssignmentChange(index, 'grade_level_id', e.target.value)} required>
                                <option value="">اختر الصف</option>
                                {gradeLevels.map(gl => <option key={gl.id} value={gl.id}>{gl.name}</option>)}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="x-small text-muted mb-1 d-block ms-1">الشعبة</label>
                              <select className="form-select border-0 bg-light x-small py-2 rounded-3" value={asn.class_id} onChange={(e) => handeAssignmentChange(index, 'class_id', e.target.value)} required disabled={!asn.grade_level_id}>
                                <option value="">اختر</option>
                                {classes.filter(c => c.grade_level_id == asn.grade_level_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="x-small text-muted mb-1 d-block ms-1">المادة</label>
                              <select className="form-select border-0 bg-light x-small py-2 rounded-3" value={asn.subject_id} onChange={(e) => handeAssignmentChange(index, 'subject_id', e.target.value)} required disabled={!asn.grade_level_id}>
                                <option value="">{asn.grade_level_id ? 'اختر المادة' : 'اختر الصف'}</option>
                                {subjects.filter(s => s.grade_level_id == asn.grade_level_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                            <div className="col-md-1 d-flex align-items-center justify-content-center">
                              <button type="button" className="btn btn-link text-danger p-0 border-0" title="إزالة" onClick={() => removeAssignmentRow(index)}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 bg-light">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>إلغاء</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 shadow-lg">
                    {isEdit ? 'تحديث البيانات' : 'حفظ المعلم والمهام'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
