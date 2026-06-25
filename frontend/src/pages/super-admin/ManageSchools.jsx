import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faSearch, faCity,
  faTimes, faSave, faEye, faMapMarkerAlt, faPhone, faEnvelope, faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const CITIES = ['صنعاء', 'تعز', 'عدن', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب', 'حجة', 'أمانة العاصمة'];
const GRADES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `الصف ${i + 1}` }));

const emptyForm = {
  name: '', name_en: '', email: '', phone: '', address: '',
  city: 'صنعاء', country: 'YE', website: '', founded_year: 2000,
  status: 'active', min_grade_id: '', max_grade_id: ''
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: 'نشط', className: 'badge-active' },
    inactive: { label: 'معطل', className: 'badge-inactive' },
    suspended: { label: 'موقوف', className: 'badge-pending' },
  };
  const s = map[status] || { label: status, className: '' };
  return <span className={`badge ${s.className}`}>{s.label}</span>;
};

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [allGrades, setAllGrades] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [modalTab, setModalTab] = useState('basic'); // basic, location, academic

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/schools?page=${page}&per_page=12`);
      setSchools(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchGrades = async () => {
    try {
      const res = await axiosInstance.get('/super-admin/grades');
      const sorted = (res.data?.data || []).sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      setAllGrades(sorted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchSchools(); 
    fetchGrades();
  }, [fetchSchools]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalTab('basic');
    setShowModal(true);
  };

  const openEdit = (school) => {
    setEditId(school.id);
    setForm({
      name: school.name || '', name_en: school.name_en || '',
      email: school.email || '', phone: school.phone || '',
      address: school.address || '', city: school.city || 'صنعاء',
      country: school.country || 'YE', website: school.website || '',
      founded_year: school.founded_year || '', status: school.status || 'active',
      min_grade_id: school.min_grade_id || '',
      max_grade_id: school.max_grade_id || ''
    });
    setShowModal(true);
  };

  const openView = (school) => {
    setSelectedSchool(school);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    // Convert founded_year to integer (HTML inputs always return strings)
    const payload = {
      ...form,
      founded_year: form.founded_year !== '' ? parseInt(form.founded_year, 10) : null,
    };

    try {
      if (editId) {
        await axiosInstance.put(`/super-admin/schools/${editId}`, payload);
        Swal.fire({ title: 'تم التحديث', text: 'تم تحديث بيانات المدرسة بنجاح', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        await axiosInstance.post('/super-admin/schools', payload);
        Swal.fire({ title: 'تمت الإضافة', text: 'تم إضافة المدرسة بنجاح', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      setShowModal(false);
      fetchSchools();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ ما';
      Swal.fire({ title: 'خطأ', text: msg, icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (school) => {
    Swal.fire({
      title: 'حذف المدرسة؟',
      html: `سيتم حذف <strong>${school.name}</strong> وجميع بياناتها نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await axiosInstance.delete(`/super-admin/schools/${school.id}`);
        Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchSchools();
      } catch (err) {
        Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'فشل الحذف', icon: 'error' });
      }
    });
  };

  const filtered = schools.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city?.includes(searchTerm)
  );

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>إدارة النظام</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>إدارة المدارس</h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {pagination?.total ?? schools.length} مدرسة مسجلة في المنظومة
              </p>
            </div>
            <button className="btn btn-sm d-flex align-items-center gap-2" onClick={openAdd}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة مدرسة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar mb-4">
        <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-muted)' }} />
        <input
          placeholder="ابحث بالاسم أو البريد أو المدينة..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card" style={{ border: 'none', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingRight: '1.5rem' }}>#</th>
                <th>المدرسة</th>
                <th>التواصل</th>
                <th>الموقع</th>
                <th>الحالة</th>
                <th>تاريخ الإضافة</th>
                <th className="text-center" style={{ paddingLeft: '1.5rem' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">
                  <div className="spinner-primary mx-auto"></div>
                  <div className="text-muted mt-3" style={{ fontSize: 13 }}>جاري التحميل...</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faCity} style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد مدارس بعد'}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {searchTerm ? 'جرّب البحث بكلمة مختلفة' : 'اضغط على إضافة مدرسة للبدء'}
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((school, idx) => (
                <tr key={school.id}>
                  <td style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>
                    {(page - 1) * 12 + idx + 1}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar" style={{
                        background: `hsl(${(school.id * 47) % 360}, 70%, 92%)`,
                        color: `hsl(${(school.id * 47) % 360}, 60%, 40%)`,
                        fontFamily: 'Cairo', fontWeight: 800
                      }}>
                        {school.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{school.name}</div>
                        {school.name_en && <div className="text-muted" style={{ fontSize: 11 }}>{school.name_en}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      {school.email && <div><FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" />{school.email}</div>}
                      {school.phone && <div><FontAwesomeIcon icon={faPhone} className="me-1 text-muted" />{school.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-muted" />
                      {school.city || '—'}
                    </div>
                  </td>
                  <td><StatusBadge status={school.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {school.created_at ? new Date(school.created_at).toLocaleDateString('ar') : '—'}
                  </td>
                  <td className="text-center" style={{ paddingLeft: '1.5rem' }}>
                    <div className="d-flex justify-content-center gap-1">
                      <button className="btn btn-icon btn-sm btn-outline-info" onClick={() => openView(school)} title="عرض التفاصيل">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="btn btn-icon btn-sm btn-outline-primary" onClick={() => openEdit(school)} title="تعديل">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn btn-icon btn-sm btn-outline-danger" onClick={() => handleDelete(school)} title="حذف">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-muted" style={{ fontSize: 13 }}>
              صفحة {pagination.current_page} من {pagination.last_page}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                السابق
              </button>
              <button className="btn btn-sm btn-outline-primary" disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}>
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar bg-primary bg-opacity-10 text-primary" style={{ width: 45, height: 45 }}>
                    <FontAwesomeIcon icon={editId ? faEdit : faPlus} />
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{editId ? 'تعديل بيانات المدرسة' : 'إضافة مدرسة جديدة'}</h5>
                    <p className="text-muted mb-0 small">يُرجى ملء كافة الحقول المطلوبة بدقة</p>
                  </div>
                </div>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-tabs px-4 mt-3">
                 <div className="d-flex gap-2 p-1 bg-light bg-opacity-50 rounded-3" style={{ border: '1px solid var(--border-color)' }}>
                    {[
                      { id: 'basic', label: 'المعلومات الأساسية', icon: faCity },
                      { id: 'location', label: 'الموقع والحالة', icon: faMapMarkerAlt },
                      { id: 'academic', label: 'النطاق التعليمي', icon: faGraduationCap },
                    ].map(t => (
                      <button 
                        key={t.id} 
                        type="button" 
                        onClick={() => setModalTab(t.id)}
                        className={`btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2 ${modalTab === t.id ? 'btn-primary shadow-sm' : 'text-muted'}`}
                        style={{ border: 'none', padding: '8px 12px' }}
                      >
                        <FontAwesomeIcon icon={t.icon} style={{ fontSize: 11 }} />
                        <span style={{ fontSize: 12 }}>{t.label}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body py-4 px-4">
                  {modalTab === 'basic' && (
                    <div className="animate-in">
                      <div className="row g-3">
                        <div className="col-md-6 text-start">
                          <label className="form-label">اسم المدرسة (عربي) <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" name="name" required value={form.name} onChange={handleInput} placeholder="مثال: مدرسة النهضة" />
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">اسم المدرسة (إنجليزي)</label>
                          <input type="text" className="form-control" name="name_en" value={form.name_en} onChange={handleInput} placeholder="English Name" dir="ltr" />
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">البريد الإلكتروني</label>
                          <input type="email" className="form-control" name="email" value={form.email} onChange={handleInput} placeholder="school@email.com" dir="ltr" />
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">رقم الهاتف</label>
                          <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleInput} placeholder="777 000 000" />
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">سنة التأسيس</label>
                          <input type="number" className="form-control" name="founded_year" value={form.founded_year} onChange={handleInput} placeholder="2000" />
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">الموقع الإلكتروني</label>
                          <input type="url" className="form-control" name="website" value={form.website} onChange={handleInput} placeholder="https://..." dir="ltr" />
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === 'location' && (
                    <div className="animate-in">
                      <div className="row g-3">
                        <div className="col-md-6 text-start">
                          <label className="form-label">المحافظة / المدينة</label>
                          <select name="city" className="form-select" value={form.city} onChange={handleInput}>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6 text-start">
                          <label className="form-label">حالة المدرسة</label>
                          <select name="status" className="form-select" value={form.status} onChange={handleInput}>
                            <option value="active">نشط (فعال)</option>
                            <option value="inactive">معطل</option>
                            <option value="suspended">موقوف مؤقتاً</option>
                          </select>
                        </div>
                        <div className="col-12 text-start">
                          <label className="form-label">العنوان التفصيلي</label>
                          <textarea className="form-control" name="address" value={form.address} onChange={handleInput} rows="3" placeholder="وصف دقيق للموقع..."></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === 'academic' && (
                    <div className="animate-in">
                      <div className="bg-primary bg-opacity-5 p-4 rounded-4 border border-primary border-opacity-10">
                        <div className="d-flex align-items-center gap-3 mb-4">
                           <div className="avatar bg-primary text-white" style={{ width: 40, height: 40, borderRadius: 12 }}>
                             <FontAwesomeIcon icon={faGraduationCap} />
                           </div>
                           <div>
                              <h6 className="fw-bold mb-0">تحديد النطاق التعليمي</h6>
                              <p className="text-muted small mb-0">اختر الصفوف الدراسية التي تدرس في هذه المدرسة</p>
                           </div>
                        </div>
                        
                        <div className="row g-4">
                          <div className="col-md-6 text-start">
                            <label className="form-label fw-bold">تبدأ من الصف</label>
                            <select name="min_grade_id" className="form-select border-primary" value={form.min_grade_id} onChange={handleInput}>
                               <option value="">-- اختر البداية --</option>
                               {allGrades.map(g => <option key={g.id} value={g.id}>{g.name} (المستوى {g.order_num})</option>)}
                            </select>
                          </div>
                          <div className="col-md-6 text-start">
                            <label className="form-label fw-bold">حتى الصف</label>
                            <select name="max_grade_id" className="form-select border-primary" value={form.max_grade_id} onChange={handleInput}>
                               <option value="">-- اختر النهاية --</option>
                               {allGrades.map(g => <option key={g.id} value={g.id}>{g.name} (المستوى {g.order_num})</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-3 border border-light">
                           <div className="d-flex gap-2 small">
                              <FontAwesomeIcon icon={faCity} className="text-primary mt-1" />
                              <span>سيتم منح المدرسة الصلاحية لإضافة فصول دراسية ومواد تقع فقط ضمن هذا النطاق المختار.</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <div className="d-flex justify-content-between w-100">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)} style={{ borderRadius: 12 }}>
                      إلغاء
                    </button>
                    <div className="d-flex gap-2">
                      {modalTab !== 'basic' && (
                        <button type="button" className="btn btn-outline-primary" 
                          onClick={() => setModalTab(modalTab === 'academic' ? 'location' : 'basic')}
                          style={{ borderRadius: 12 }}>
                          السابق
                        </button>
                      )}
                      
                      {modalTab !== 'academic' ? (
                        <button type="button" className="btn btn-primary px-4" 
                          onClick={() => setModalTab(modalTab === 'basic' ? 'location' : 'academic')}
                          style={{ borderRadius: 12 }}>
                          التالي
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-success px-5" disabled={saving} style={{ borderRadius: 12 }}>
                          {saving ? <div className="spinner-border spinner-border-sm" /> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                          <span>{editId ? 'حفظ التعديلات' : 'إتمام الإضافة'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && selectedSchool && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="modal-body p-0">
                {/* Header Profile */}
                <div className="p-4 text-white position-relative" style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                }}>
                  <button className="btn btn-sm btn-light position-absolute" onClick={() => setShowViewModal(false)}
                    style={{ top: 20, left: 20, width: 32, height: 32, padding: 0, borderRadius: '50%', color: 'var(--primary)', border: 'none' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  
                  <div className="d-flex align-items-center gap-4 mt-2">
                    <div className="avatar bg-white bg-opacity-20 text-white shadow-sm" style={{ width: 80, height: 80, fontSize: 32, borderRadius: 'var(--radius-md)' }}>
                      {selectedSchool.name?.[0]}
                    </div>
                    <div>
                      <h3 className="fw-black mb-1" style={{ fontFamily: 'Cairo', color: '#fff' }}>{selectedSchool.name}</h3>
                      <div className="d-flex align-items-center gap-2 opacity-80" style={{ color: '#fff' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{selectedSchool.city}, اليمن</span>
                        <StatusBadge status={selectedSchool.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="row g-4">
                    {/* Basic Info Col */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--primary)' }}>
                        <FontAwesomeIcon icon={faCity} /> المعلومات العامة
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm">
                          <label className="text-muted small fw-bold d-block mb-1">الاسم بالإنجليزية</label>
                          <div className="fw-bold text-main">{selectedSchool.name_en || '—'}</div>
                        </div>
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm">
                          <label className="text-muted small fw-bold d-block mb-1">سنة التأسيس</label>
                          <div className="fw-bold text-main">{selectedSchool.founded_year || '—'}</div>
                        </div>
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm" style={{ borderRight: '4px solid var(--accent) !important' }}>
                           <label className="text-muted small fw-bold d-block mb-1">النطاق الدراسي</label>
                           <div className="fw-bold text-primary">
                             من: {allGrades.find(g => String(g.id) === String(selectedSchool.min_grade_id))?.name || '—'} <br />
                             إلى: {allGrades.find(g => String(g.id) === String(selectedSchool.max_grade_id))?.name || '—'}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Col */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--success)' }}>
                        <FontAwesomeIcon icon={faPhone} /> التواصل والموقع
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm">
                          <label className="text-muted small fw-bold d-block mb-1">البريد الإلكتروني</label>
                          <div className="fw-bold text-main">{selectedSchool.email || '—'}</div>
                        </div>
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm">
                          <label className="text-muted small fw-bold d-block mb-1">رقم الهاتف</label>
                          <div className="fw-bold text-main">{selectedSchool.phone || '—'}</div>
                        </div>
                        <div className="bg-light bg-opacity-50 p-3 rounded-3 border border-light shadow-sm">
                          <label className="text-muted small fw-bold d-block mb-1">العنوان الكامل</label>
                          <div className="fw-bold text-main">{selectedSchool.address || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-light bg-opacity-30 text-center" style={{ borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                   <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowViewModal(false)}>إغلاق النافذة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [data-theme='dark'] .text-main { color: var(--text-main) !important; }
        [data-theme='dark'] .bg-light { background-color: rgba(255,255,255,0.05) !important; }
        [data-theme='dark'] .border-light { border-color: rgba(255,255,255,0.1) !important; }
        [data-theme='dark'] .modal-content { border: 1px solid rgba(255,255,255,0.1) !important; }
      `}</style>
    </div>
  );
};

export default ManageSchools;
