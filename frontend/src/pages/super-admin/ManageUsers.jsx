import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faPlus, faEdit, faTrash, faSearch,
  faTimes, faSave, faLock, faUserShield, faUser, faCity,
  faChalkboardTeacher, faGraduationCap, faUserTie, faEye, faEnvelope, faPhone
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ROLE_MAP = {
  super_admin:  { label: 'مدير عام',      icon: faUserShield,       color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  school_admin: { label: 'مدير مدرسة',    icon: faUserTie,          color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  teacher:      { label: 'معلم',           icon: faChalkboardTeacher, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  student:      { label: 'طالب',           icon: faGraduationCap,    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  parent:       { label: 'ولي أمر',        icon: faUser,             color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
};

const emptyForm = {
  name: '', email: '', phone: '', password: '', role: 'school_admin', is_active: 1, school_id: ''
};

const ManageUsers = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(null);
  const [schools, setSchools]       = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);
  const location = useLocation();
  const isAdminOnlyMode = location.pathname === '/super/admins';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/users?page=${page}&per_page=15`);
      setUsers(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  const fetchSchools = async () => {
    try {
      const res = await axiosInstance.get('/super-admin/schools?per_page=500');
      setSchools(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    if (isAdminOnlyMode) {
      setFilterRole('school_admin');
    } else {
      setFilterRole('all');
    }
    fetchUsers(); 
    fetchSchools();
  }, [fetchUsers, isAdminOnlyMode]);

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ 
      name: u.name || '', email: u.email || '', phone: u.phone || '', 
      password: '', role: u.role || 'school_admin', is_active: u.is_active,
      school_id: u.school_id || ''
    });
    setShowModal(true);
  };

  const openView = (u) => {
    setSelectedUser(u);
    setShowViewModal(true);
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.is_active ? 0 : 1;
      await axiosInstance.put(`/super-admin/users/${user.id}`, { 
        ...user, 
        is_active: newStatus 
      });
      Swal.fire({
        title: newStatus ? 'تم منح الصلاحية' : 'تم سحب الصلاحية',
        text: newStatus ? 'يمكن للمدير الآن دخول النظام' : 'تم إيقاف حساب المدير بنجاح',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: 'فشلت العملية', icon: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editId) {
        await axiosInstance.put(`/super-admin/users/${editId}`, payload);
        Swal.fire({ title: 'تم التحديث', icon: 'success', timer: 1800, showConfirmButton: false });
      } else {
        await axiosInstance.post('/super-admin/users', payload);
        Swal.fire({ title: 'تمت الإضافة', icon: 'success', timer: 1800, showConfirmButton: false });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      let errorMsg = err.response?.data?.message || 'حدث خطأ في النظام';
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMsg = Object.values(errors).flat().join('\n');
      }
      Swal.fire({ title: 'خطأ في التحقق', text: errorMsg, icon: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = (user) => {
    Swal.fire({
      title: 'حذف المستخدم؟',
      html: `سيتم حذف <strong>${user.name}</strong> نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف', cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await axiosInstance.delete(`/super-admin/users/${user.id}`);
        Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchUsers();
      } catch (err) {
        Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'فشل الحذف', icon: 'error' });
      }
    });
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة النظام</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>
                {isAdminOnlyMode ? 'مدراء المدارس' : 'إدارة المستخدمين'}
              </h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {isAdminOnlyMode 
                  ? `يوجد ${users.filter(u => u.role === 'school_admin').length} مدير مدرسة مسجل`
                  : `${pagination?.total ?? users.length} مستخدم في النظام`
                }
              </p>
            </div>
            <button className="btn btn-sm d-flex align-items-center gap-2" onClick={openAdd}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}>
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة مستخدم</span>
            </button>
          </div>
        </div>
      </div>

      {!isAdminOnlyMode && (
        <div className="d-flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => setFilterRole('all')}
            className="btn btn-sm"
            style={{ borderRadius: 20, background: filterRole === 'all' ? 'var(--primary)' : 'var(--bg-card)', color: filterRole === 'all' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}
          >
            الكل ({users.length})
          </button>
          {Object.entries(ROLE_MAP).map(([role, info]) => (
            <button key={role} onClick={() => setFilterRole(role)}
              className={`btn btn-sm ${filterRole === role ? 'shadow-sm' : ''}`}
              style={{ borderRadius: 20, background: filterRole === role ? info.color : 'var(--bg-card)', color: filterRole === role ? '#fff' : 'var(--text-muted)', border: `1px solid ${filterRole === role ? info.color : 'var(--border-color)'}` }}
            >
              <FontAwesomeIcon icon={info.icon} className="me-1" />
              {info.label} {roleCounts[role] ? `(${roleCounts[role]})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="search-bar mb-4">
        <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-muted)' }} />
        <input placeholder="ابحث بالاسم أو البريد الإلكتروني..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FontAwesomeIcon icon={faTimes} /></button>}
      </div>

      {/* Table */}
      <div className="card" style={{ border: 'none', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingRight: '1.5rem' }}>#</th>
                <th>المستخدم</th>
                <th>الدور</th>
                <th>التواصل</th>
                <th>الحالة</th>
                <th>آخر دخول</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">
                  <div className="spinner-primary mx-auto"></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 700 }}>لا توجد نتائج</div>
                  </div>
                </td></tr>
              ) : filtered.map((u, idx) => {
                const roleInfo = ROLE_MAP[u.role] || { label: u.role, color: '#gray', bg: '#eee' };
                return (
                  <tr key={u.id}>
                    <td style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>{idx + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar" style={{ background: roleInfo.bg, color: roleInfo.color, fontFamily: 'Cairo', fontWeight: 800 }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: roleInfo.bg, color: roleInfo.color,
                        padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700
                      }}>
                        <FontAwesomeIcon icon={roleInfo.icon} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{u.email || '—'}</div>
                      <div className="text-muted">{u.phone || ''}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {u.is_active ? 'مفعّل' : 'معطّل'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('ar') : 'لم يسجل بعد'}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-icon btn-sm btn-outline-info" onClick={() => openView(u)} title="معاينة">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-outline-primary" onClick={() => openEdit(u)} title="تعديل">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className={`btn btn-icon btn-sm ${u.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                          onClick={() => toggleUserStatus(u)} 
                          title={u.is_active ? "سحب الصلاحية" : "منح الصلاحية"}
                        >
                          <FontAwesomeIcon icon={u.is_active ? faLock : faSave} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-outline-danger" onClick={() => handleDelete(u)} title="حذف">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-muted" style={{ fontSize: 13 }}>صفحة {pagination.current_page} من {pagination.last_page}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</button>
              <button className="btn btn-sm btn-outline-primary" disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}>التالي</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div className="modal-header border-0 p-4 pb-0" style={{ background: 'var(--bg-card)' }}>
                <div>
                  <h4 className="fw-black mb-1" style={{ color: 'var(--primary)', fontFamily: 'Cairo' }}>
                    {editId ? 'تحديث بيانات الكادر' : 'إضافة عضو جديد'}
                  </h4>
                  <p className="text-muted small mb-0">يرجى ملء كافة البيانات المطلوبة لضمان صحة التسجيل</p>
                </div>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Full Name */}
                    <div className="col-md-12">
                      <label className="form-label fw-bold small text-muted mb-2">الاسم الكامل (رباعي)</label>
                      <div className="input-group-modern">
                         <span className="input-icon"><FontAwesomeIcon icon={faUser} /></span>
                         <input type="text" className="form-control-modern" name="name" required value={form.name} onChange={handleInput} placeholder="كامل بن محمد ..." />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted mb-2">البريد الإلكتروني</label>
                      <div className="input-group-modern">
                         <span className="input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                         <input type="email" className="form-control-modern" name="email" value={form.email} onChange={handleInput} placeholder="name@example.com" dir="ltr" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted mb-2">رقم الهاتف</label>
                      <div className="input-group-modern">
                         <span className="input-icon"><FontAwesomeIcon icon={faPhone} /></span>
                         <input type="tel" className="form-control-modern" name="phone" value={form.phone} onChange={handleInput} placeholder="7xx xxx xxx" />
                      </div>
                    </div>

                    {/* Password & Role */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted mb-2">
                         كلمة المرور {!editId && <span className="text-danger">*</span>}
                      </label>
                      <div className="input-group-modern">
                         <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                         <input type="password" className="form-control-modern" name="password" required={!editId} value={form.password} onChange={handleInput} placeholder={editId ? '••••••••' : 'أدخل كلمة المرور'} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted mb-2">الدور الوظيفي في النظام</label>
                      <div className="input-group-modern">
                         <span className="input-icon"><FontAwesomeIcon icon={faUserShield} /></span>
                         <select name="role" className="form-select border-0 shadow-none bg-transparent" value={form.role} onChange={handleInput} disabled={isAdminOnlyMode}>
                           {Object.entries(ROLE_MAP).map(([r, info]) => (
                             <option key={r} value={r}>{info.label}</option>
                           ))}
                         </select>
                      </div>
                    </div>

                    {/* School Selection IF School Admin */}
                    {form.role === 'school_admin' && (
                      <div className="col-12">
                        <div className="school-selector-card p-3 rounded-4" style={{ background: 'rgba(99,102,241,0.03)', border: '1.5px dashed rgba(99,102,241,0.2)' }}>
                          <label className="form-label fw-black text-primary small mb-3">تخصيص المدرسة التابعة</label>
                          <div className="input-group-modern bg-white">
                             <span className="input-icon text-primary"><FontAwesomeIcon icon={faCity} /></span>
                             <select 
                                name="school_id" 
                                className="form-select border-0 shadow-none bg-transparent" 
                                required 
                                value={form.school_id} 
                                onChange={handleInput}
                             >
                                <option value="">-- اضغط لاختيار المدرسة من القائمة --</option>
                                {schools.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                                ))}
                             </select>
                          </div>
                          <p className="mt-2 text-muted small mb-0"><FontAwesomeIcon icon={faSearch} className="me-1" /> يمكن للمدير المختار إدارة كافة شؤون هذه المدرسة حصراً.</p>
                        </div>
                      </div>
                    )}

                    {/* Active Toggle */}
                    <div className="col-12">
                       <label className="custom-toggle-btn d-flex align-items-center justify-content-between p-3 rounded-4" style={{ background: form.is_active ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1.5px solid ${form.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}`, cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-3">
                             <div className={`icon-circle ${form.is_active ? 'bg-success' : 'bg-danger'} text-white shadow-sm`}>
                                <FontAwesomeIcon icon={form.is_active ? faUserShield : faLock} />
                             </div>
                             <div>
                                <div className="fw-bold fs-14">حالة التفعيل</div>
                                <div className="text-muted fs-12">{form.is_active ? 'الحساب مفعّل حالياً ويمكن تسجيل الدخول' : 'الحساب موقوف ولا يمكن الدخول للنظام'}</div>
                             </div>
                          </div>
                          <div className="form-check form-switch p-0 m-0">
                             <input type="checkbox" className="form-check-input ms-0" name="is_active" 
                               checked={!!form.is_active} onChange={handleInput} style={{ width: 45, height: 22, cursor: 'pointer' }} />
                          </div>
                       </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)} style={{ borderRadius: 12 }}>إغلاق</button>
                  <button type="submit" className="btn btn-primary px-5 shadow-sm fw-bold" disabled={saving} style={{ borderRadius: 12 }}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                    {editId ? 'حفظ التعديلات' : 'إتمام الإضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View User Modal Redesigned */}
      {showViewModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="modal-body p-0">
                {/* Header with Gradient and Profile */}
                <div className="p-5 text-white text-center position-relative" style={{ 
                  background: 'linear-gradient(225deg, var(--primary) 0%, var(--secondary) 100%)',
                }}>
                  <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setShowViewModal(false)}></button>
                  
                  <div className="position-relative d-inline-block mb-3">
                    <div className="rounded-circle border border-4 border-white border-opacity-20 p-1">
                      <div className="avatar bg-white text-primary fw-black shadow-lg" style={{ width: 90, height: 90, fontSize: 36, borderRadius: '50%' }}>
                        {selectedUser.name?.[0]}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="fw-black mb-1" style={{ fontFamily: 'Cairo' }}>{selectedUser.name}</h3>
                  <div className="d-flex align-items-center justify-content-center gap-2 opacity-90">
                    <FontAwesomeIcon icon={ROLE_MAP[selectedUser.role]?.icon} />
                    <span className="fw-bold">{ROLE_MAP[selectedUser.role]?.label}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="row g-3">
                    {/* Item Card: Email */}
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-4 bg-light bg-opacity-50 border border-light transition-all hover-lift">
                        <div className="icon-box bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3" style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div className="flex-grow-1 text-start">
                          <label className="text-muted small d-block mb-0 fw-bold">البريد الإلكتروني</label>
                          <div className="fw-bold text-main">{selectedUser.email || '—'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Item Card: Phone */}
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-4 bg-light bg-opacity-50 border border-light transition-all hover-lift">
                        <div className="icon-box bg-success bg-opacity-10 text-success p-3 rounded-3 me-3" style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <div className="flex-grow-1 text-start">
                          <label className="text-muted small d-block mb-0 fw-bold">رقم الهاتف المحلي</label>
                          <div className="fw-bold text-main">{selectedUser.phone || '—'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Item Card: School (Key Item) */}
                    {selectedUser.role === 'school_admin' && (
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.08), transparent)', border: '1.5px solid rgba(99,102,241,0.1)' }}>
                          <div className="icon-box bg-primary text-white p-3 rounded-3 me-3 shadow-sm" style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon icon={faCity} />
                          </div>
                          <div className="flex-grow-1 text-start">
                            <label className="text-primary small d-block mb-0 fw-black" style={{ letterSpacing: 0.5 }}>المدرسة المسؤولة</label>
                            <div className="fw-bold text-main h6 mb-0 mt-1">
                              {schools.find(s => String(s.id) === String(selectedUser.school_id))?.name || 'لم يتم الربط بمدرسة بعد'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item Card: Status */}
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-4 bg-light bg-opacity-50 border border-light transition-all hover-lift">
                        <div className={`icon-box ${selectedUser.is_active ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${selectedUser.is_active ? 'text-success' : 'text-danger'} p-3 rounded-3 me-3`} style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon icon={selectedUser.is_active ? faUserShield : faLock} />
                        </div>
                        <div className="flex-grow-1 d-flex justify-content-between align-items-center text-start">
                          <div>
                            <label className="text-muted small d-block mb-0 fw-bold">حالة الحساب حالياً</label>
                            <StatusBadge active={selectedUser.is_active} />
                          </div>
                          <button className={`btn btn-sm ${selectedUser.is_active ? 'btn-outline-danger' : 'btn-outline-success'} px-3`} style={{ borderRadius: 10, fontSize: 11 }} onClick={() => toggleUserStatus(selectedUser)}>
                             {selectedUser.is_active ? 'سحب الصلاحية' : 'تفعيل الحساب'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-light bg-opacity-20 text-center border-top">
                   <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-primary px-4 shadow-sm" style={{ borderRadius: 12, fontSize: 13 }} onClick={() => { setShowViewModal(false); openEdit(selectedUser); }}>
                        <FontAwesomeIcon icon={faEdit} className="me-2" /> تعديل البيانات
                      </button>
                      <button className="btn btn-outline-secondary px-4" style={{ borderRadius: 12, fontSize: 13 }} onClick={() => setShowViewModal(false)}>
                        إغلاق
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .input-group-modern {
          display: flex;
          align-items: center;
          background: var(--bg-body);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          padding: 5px 15px;
          transition: all 0.3s ease;
        }
        .input-group-modern:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }
        .input-icon {
          color: var(--text-muted);
          margin-left: 12px;
          font-size: 1.1rem;
        }
        .form-control-modern {
          border: none;
          background: transparent;
          width: 100%;
          padding: 8px 0;
          color: var(--text-main);
          font-weight: 600;
          outline: none;
        }
        .icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); }
        .fw-black { font-weight: 900 !important; }
        .fs-14 { font-size: 14px; }
        .fs-12 { font-size: 12px; }
      `}</style>
    </div>
  );
};

const StatusBadge = ({ active }) => (
  <span className={`badge ${active ? 'badge-active' : 'badge-inactive'}`}>
    {active ? 'نشط ومفعّل' : 'موقف من الإدارة'}
  </span>
);

export default ManageUsers;
