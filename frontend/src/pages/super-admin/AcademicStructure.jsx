import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap, faPlus, faTrash, faEdit, 
  faLayerGroup, faSave, faTimes, faSortNumericDown, faSearch, faCity
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const AcademicStructure = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', order_num: '' });

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/grades');
      // Sort by order_num on frontend just to be sure
      const sorted = (res.data?.data || []).sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      setGrades(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', order_num: grades.length + 1 });
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditId(g.id);
    setForm({ name: g.name, order_num: g.order_num });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        school_id: 1 // Logic: SuperAdmin grades are stored as central (school_id 1)
      };

      if (editId) {
        await axiosInstance.put(`/super-admin/grades/${editId}`, payload);
        Swal.fire({ title: 'تم التحديث', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        await axiosInstance.post('/super-admin/grades', payload);
        Swal.fire({ title: 'تمت الإضافة', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchGrades();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'تعذر حفظ البيانات', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (grade) => {
    Swal.fire({
      title: 'حذف الصف؟',
      text: `سيتم حذف "${grade.name}" نهائياً من النظام!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/super-admin/grades/${grade.id}`);
          Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
          fetchGrades();
        } catch (err) {
          Swal.fire({ title: 'خطأ', text: 'لا يمكن حذف الصف لارتباطه ببيانات أخرى', icon: 'error' });
        }
      }
    });
  };

  const filteredGrades = grades.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    String(g.order_num).includes(search)
  );

  return (
    <div className="academic-structure-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة النظام المركزي</div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>الهيكل الأكاديمي (الصفوف)</h2>
              <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                تعريف المراحل الدراسية وترتيبها الرقمي لضبط نطاق المدارس
              </p>
            </div>
            <button className="btn btn-light shadow-sm fw-bold px-4" onClick={openAdd} style={{ borderRadius: 12 }}>
              <FontAwesomeIcon icon={faPlus} className="me-2 text-primary" /> إضافة صف تعليمي
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        {/* Search & Stats Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 20 }}>
          <div className="card-body p-4">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <div className="search-bar-modern">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن صف (اسم أو رقم)..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="badge bg-primary bg-opacity-10 text-primary p-3 px-4 rounded-pill fw-bold">
                  إجمالي الصفوف المعرفة: {grades.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Grid */}
        <div className="row g-4 animate-in">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">جاري تحميل الهيكل التعليمي...</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="col-12">
              <div className="empty-state py-5 card border-0 shadow-sm rounded-4">
                 <FontAwesomeIcon icon={faLayerGroup} size="4x" className="mb-3 opacity-20" />
                 <h4 className="fw-bold">لا يوجد هيكل مضاف بعد</h4>
                 <p className="text-muted">ابدأ بإضافة الصفوف الدراسية الأساسية للنظام</p>
                 <button className="btn btn-primary" onClick={openAdd}>إضافة أول صف</button>
              </div>
            </div>
          ) : (
            filteredGrades.map((grade) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={grade.id}>
                <div className="card border-0 shadow-sm h-100 transition-all grade-card">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`level-badge bg-primary text-white shadow`}>
                        {grade.order_num}
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-icon-sm variant-light-primary" onClick={() => openEdit(grade)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn btn-icon-sm variant-light-danger" onClick={() => handleDelete(grade)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <h5 className="fw-black mb-1" style={{ fontFamily: 'Cairo' }}>{grade.name}</h5>
                    <p className="text-muted small mb-3">الترتيب الرقمي: {grade.order_num}</p>
                    
                    <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                       <span className="small fw-bold text-muted"><FontAwesomeIcon icon={faCity} className="me-2 opacity-50" />عدد المدارس</span>
                       <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">{grade.school_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: 25 }}>
              <div className="modal-header border-0 bg-primary text-white p-4">
                <h5 className="fw-black mb-0" style={{ fontFamily: 'Cairo' }}>
                  {editId ? 'تعديل بيانات الصف' : 'إضافة صف دراسي جديد'}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted small mb-2">اسم الصف الدراسي</label>
                    <div className="input-group-modern">
                       <span className="input-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
                       <input 
                        type="text" 
                        className="form-control-modern" 
                        name="name" 
                        required 
                        value={form.name} 
                        onChange={handleInput} 
                        placeholder="مثال: الصف التاسع"
                       />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-bold text-muted small mb-2">الترتيب الرقمي (مهم جداً للمقارنة)</label>
                    <div className="input-group-modern">
                       <span className="input-icon text-primary"><FontAwesomeIcon icon={faSortNumericDown} /></span>
                       <input 
                        type="number" 
                        className="form-control-modern" 
                        name="order_num" 
                        required 
                        value={form.order_num} 
                        onChange={handleInput} 
                        placeholder="مثال: 9"
                       />
                    </div>
                    <p className="mt-2 text-muted x-small">
                       * ملاحظة: يستخدم هذا الرقم لتحديد نطاق المدارس (مثلاً من صف 7 إلى صف 12).
                    </p>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)} style={{ borderRadius: 12 }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary px-5 shadow-sm fw-bold" disabled={saving} style={{ borderRadius: 12 }}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                    {editId ? 'حفظ التعديلات' : 'إضافة الصف'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .academic-structure-page {
          background-color: var(--bg-body);
          min-height: 100vh;
        }
        .search-bar-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-body);
          border: 1.5px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 15px;
          transition: 0.3s;
        }
        .search-bar-modern:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }
        .search-bar-modern input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-weight: 600;
        }
        .grade-card {
          border-radius: 18px;
          border-bottom: 4px solid var(--primary);
        }
        .level-badge {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 900;
          font-size: 1.2rem;
        }
        .btn-icon-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: 0.2s;
        }
        .variant-light-primary { background: rgba(99,102,241,0.1); color: var(--primary); }
        .variant-light-danger { background: rgba(239,68,68,0.1); color: var(--danger); }
        .fw-black { font-weight: 900 !important; }
        .x-small { font-size: 11px; }

        .input-group-modern {
          display: flex;
          align-items: center;
          background: var(--bg-body);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          padding: 5px 15px;
        }
        .input-icon { margin-left: 10px; opacity: 0.5; }
        .form-control-modern {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          padding: 8px 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AcademicStructure;
