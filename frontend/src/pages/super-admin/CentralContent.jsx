import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap, faPlus, faTrash, faEdit, faSearch, faFolderOpen,
  faArrowRight, faBook, faFilePdf, faCloudUploadAlt, faHistory,
  faSave, faTimes, faChevronLeft, faEllipsisV, faEye, faCogs, faServer
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const CentralContent = () => {
  // Navigation State
  const [view, setView] = useState('grades'); // grades -> subjects -> resources
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(1);

  // Data State
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', type: 'curriculum', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Fetch Grades
  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/grades');
      setGrades(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // 2. Fetch Subjects for a Grade (Term-independent now)
  const fetchSubjects = useCallback(async (gradeId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/subjects?school_id=1&grade_id=${gradeId}`);
      setSubjects(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // 3. Fetch Resources for a Subject & Term
  const fetchResources = useCallback(async (subjectId, term) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/content?subject_id=${subjectId}&term=${term}`);
      setResources(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (view === 'grades') fetchGrades();
    if (view === 'subjects' && selectedGrade) fetchSubjects(selectedGrade.id);
    if (view === 'resources' && selectedSubject) fetchResources(selectedSubject.id, selectedTerm);
  }, [view, selectedGrade, selectedTerm, selectedSubject, fetchGrades, fetchSubjects, fetchResources]);

  // --- Handlers ---
  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setSelectedTerm(1);
    setView('subjects');
  };

  const handleSubjectClick = (sub) => {
    setSelectedSubject(sub);
    setView('resources');
  };

  const goBack = () => {
    if (view === 'resources') setView('subjects');
    else if (view === 'subjects') setView('grades');
  };

  const handleOpenModal = (item = null) => {
    setEditItem(item);
    if (view === 'subjects') {
      setForm({ name: item ? item.name : '' });
    } else {
      setForm({ title: item ? item.title : '', type: item ? item.type : 'curriculum', description: item ? item.description : '' });
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (view === 'subjects') {
        const payload = { ...form, school_id: 1, grade_level_id: selectedGrade.id };
        if (editItem) {
          await axiosInstance.put(`/super-admin/subjects/${editItem.id}`, payload);
        } else {
          await axiosInstance.post('/super-admin/subjects', payload);
        }
        fetchSubjects(selectedGrade.id);
      } else {
        // Resources (Multipart form for file)
        const formData = new FormData();
        formData.append('subject_id', selectedSubject.id);
        formData.append('title', form.title);
        formData.append('type', form.type);
        formData.append('description', form.description || '');
        formData.append('term', selectedTerm);
        if (selectedFile) formData.append('file', selectedFile);

        if (editItem) {
           // await axiosInstance.put(`/super-admin/content/${editItem.id}`, formData); 
        } else {
           await axiosInstance.post('/super-admin/content', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
           });
        }
        fetchResources(selectedSubject.id, selectedTerm);
      }
      setShowModal(false);
      Swal.fire({ title: 'تمت العملية', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'تعذر الإكمال', icon: 'error' });
    } finally { setSaving(false); }
  };

  const handleDeleteSub = (sub) => {
    Swal.fire({
      title: 'حذف المقرر؟',
      text: 'سيتم حذف المادة بكافة محتوياتها التعليمية!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axiosInstance.delete(`/super-admin/subjects/${sub.id}`);
        fetchSubjects(selectedGrade.id);
      }
    });
  };

  const handleDeleteResource = (res) => {
    Swal.fire({
      title: 'حذف الملف؟',
      icon: 'warning',
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axiosInstance.delete(`/super-admin/content/${res.id}`);
        fetchResources(selectedSubject.id, selectedTerm);
      }
    });
  };

  const TYPE_LABELS = {
    curriculum: 'ملف المنهج الأساسي',
    summary: 'ملخصات تعليمية',
    reference: 'مراجع إثرائية',
    book: 'الكتاب المدرسي',
    presentation: 'عروض تقديمية',
    other: 'نماذج اختبارات/أخرى'
  };

  return (
    <div className="central-content-page">
      {/* Dynamic Hero */}
      <div className="page-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
           <div className="d-flex align-items-center gap-3">
              {view !== 'grades' && (
                <button className="btn-back-circle shadow-sm" onClick={goBack}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                   إدارة المحتوى المركزي 
                   {selectedGrade && ` > ${selectedGrade.name}`}
                   {selectedSubject && ` > ${selectedSubject.name}`}
                </div>
                <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>
                   {view === 'grades' && 'المحتوى الأكاديمي الموحد'}
                   {view === 'subjects' && `مقررات ${selectedGrade.name}`}
                   {view === 'resources' && `مكتبة ${selectedSubject.name}`}
                </h2>
              </div>
           </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        
        {/* --- VIEW 1: GRADES --- */}
        {view === 'grades' && (
          <div className="row g-4 animate-in">
             {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> :
              grades.map(g => (
                <div className="col-xl-3 col-lg-4 col-md-6" key={g.id}>
                  <div className="card-minimal h-100 hover-lift shadow-sm">
                    <div className="card-body p-4 text-center">
                       <div className="grade-icon mb-3 mx-auto">
                          <FontAwesomeIcon icon={faServer} />
                       </div>
                       <h5 className="fw-black mb-1">{g.name}</h5>
                       <p className="text-muted small mb-4">المستوى الأكاديمي: {g.order_num}</p>
                       <button className="btn btn-primary w-100 py-2 rounded-4 fw-bold" onClick={() => handleGradeClick(g)}>
                          إدارة الصف
                       </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* --- VIEW 2: SUBJECTS --- */}
        {view === 'subjects' && (
           <div className="animate-in">
              {/* Term Selector */}
              <div className="term-selector mb-4 p-2 bg-white shadow-sm rounded-4 d-inline-flex gap-2">
                 {[1, 2].map(t => (
                   <button 
                      key={t}
                      className={`btn px-5 py-2 rounded-4 fw-bold transition-all ${selectedTerm === t ? 'btn-primary' : 'btn-light text-muted'}`}
                      onClick={() => setSelectedTerm(t)}
                   >
                      الترم {t === 1 ? 'الأول' : 'الثاني'}
                   </button>
                 ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h4 className="fw-black mb-0" style={{ color: 'var(--primary)' }}>إدارة المقررات الدراسية</h4>
                 <button className="btn btn-outline-primary fw-bold px-4 rounded-4" onClick={() => handleOpenModal()}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> إضافة مادة جديدة
                 </button>
              </div>

              <div className="row g-4">
                 {loading ? <div className="text-center py-5 w-100"><div className="spinner-border text-primary"></div></div> :
                  subjects.length === 0 ? (
                    <div className="col-12"><div className="empty-state card py-5 border-0"><FontAwesomeIcon icon={faBook} size="4x" className="mb-3 opacity-10" /><h5>لا يوجد مواد مضافة لهذا الصف</h5></div></div>
                  ) :
                  subjects.map(sub => (
                    <div className="col-xl-4 col-md-6" key={sub.id}>
                       <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                          <div className="card-body p-4">
                             <div className="d-flex justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                   <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                                      <FontAwesomeIcon icon={faBook} size="lg" />
                                   </div>
                                   <div>
                                      <h5 className="fw-bold mb-0">{sub.name}</h5>
                                      <span className="text-muted small">ID: {sub.id}</span>
                                   </div>
                                </div>
                                <div className="dropdown">
                                   <button className="btn btn-light btn-sm" data-bs-toggle="dropdown"><FontAwesomeIcon icon={faEllipsisV} /></button>
                                   <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3">
                                      <li><button className="dropdown-item py-2" onClick={() => handleOpenModal(sub)}><FontAwesomeIcon icon={faEdit} className="me-2 text-primary" /> تعديل</button></li>
                                      <li><button className="dropdown-item py-2 text-danger" onClick={() => handleDeleteSub(sub)}><FontAwesomeIcon icon={faTrash} className="me-2" /> حذف</button></li>
                                   </ul>
                                </div>
                             </div>
                             <div className="divider my-3"></div>
                             <button className="btn btn-indigo w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 shadow-none fw-bold" onClick={() => handleSubjectClick(sub)}>
                                <FontAwesomeIcon icon={faFolderOpen} />
                                إدارة محتوى المقرر
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
              </div>
           </div>
        )}

        {/* --- VIEW 3: RESOURCES --- */}
        {view === 'resources' && (
           <div className="animate-in">
              <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm border-end-primary">
                 <div>
                    <h4 className="fw-black mb-1">{selectedSubject.name}</h4>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 rounded-pill">
                      المكتبة المركزية - {selectedTerm === 1 ? 'الترم الأول' : 'الترم الثاني'}
                    </span>
                 </div>
                 <button className="btn btn-primary px-4 rounded-4 fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" /> رفع ملف / مراجع جديدة
                 </button>
              </div>

              <div className="card border-0 shadow-sm rounded-4">
                 <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                       <thead className="bg-light">
                          <tr>
                             <th className="ps-4">عنوان الملف</th>
                             <th>النوع</th>
                             <th>الحجم</th>
                             <th>تاريخ الرفع</th>
                             <th className="text-center pe-4">إجراءات</th>
                          </tr>
                       </thead>
                       <tbody>
                          {loading ? <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr> :
                           resources.length === 0 ? <tr><td colSpan="5" className="text-center py-5 text-muted">لم يتم رفع أي محتوى لهذا المقرر بعد</td></tr> :
                           resources.map(file => (
                             <tr key={file.id}>
                                <td className="ps-4">
                                   <div className="d-flex align-items-center gap-3">
                                      <div className="text-danger"><FontAwesomeIcon icon={faFilePdf} size="lg" /></div>
                                      <div>
                                         <div className="fw-bold">{file.title}</div>
                                         <div className="x-small text-muted">{file.description || 'لا يوجد وصف'}</div>
                                      </div>
                                   </div>
                                </td>
                                <td><span className="badge-type">{TYPE_LABELS[file.type] || 'أخرى'}</span></td>
                                <td className="small text-muted">{file.file_size_formatted}</td>
                                <td className="small text-muted">{new Date(file.created_at).toLocaleDateString('ar-YE')}</td>
                                <td className="text-center pe-4">
                                   <div className="d-flex gap-2 justify-content-center">
                                      <a href={file.file_path} target="_blank" rel="noreferrer" className="btn btn-sm btn-light text-primary"><FontAwesomeIcon icon={faEye} /></a>
                                      <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteResource(file)}><FontAwesomeIcon icon={faTrash} /></button>
                                   </div>
                                </td>
                             </tr>
                           ))
                          }
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

      </div>

      {/* Shared Modal for Subjects/Resources */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 25, overflow: 'hidden' }}>
              <div className="modal-header border-0 bg-primary text-white p-4">
                 <h5 className="fw-bold mb-0">
                    {view === 'subjects' ? (editItem ? 'تعديل المقرر' : 'إضافة مقرر جديد') : (editItem ? 'تعديل الملف' : 'رفع ملف تعليمي')}
                 </h5>
                 <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                 <div className="modal-body p-4">
                    {view === 'subjects' ? (
                       <div className="mb-3">
                          <label className="form-label text-muted small fw-bold">اسم المادة / المقرر</label>
                          <div className="input-group-modern">
                             <span className="input-icon"><FontAwesomeIcon icon={faBook} /></span>
                             <input type="text" className="form-control-modern" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: لغة عربية" />
                          </div>
                       </div>
                    ) : (
                       <div className="row g-3">
                          <div className="col-12">
                             <label className="form-label text-muted small fw-bold">عنوان المستند</label>
                             <div className="input-group-modern">
                                <span className="input-icon"><FontAwesomeIcon icon={faEdit} /></span>
                                <input type="text" className="form-control-modern" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثال: ملخص الفصل الأول" />
                             </div>
                          </div>
                          <div className="col-12">
                             <label className="form-label text-muted small fw-bold">نوع المحتوى</label>
                             <select className="form-select border-0 bg-light p-3 rounded-3" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                             </select>
                          </div>
                          <div className="col-12">
                             <label className="form-label text-muted small fw-bold">اختيار الملف (PDF, DOCX, ZIP...)</label>
                             <input type="file" className="form-control p-3 rounded-3" onChange={e => setSelectedFile(e.target.files[0])} required={!editItem} />
                          </div>
                          <div className="col-12">
                             <label className="form-label text-muted small fw-bold">وصف برأس أقلام (اختياري)</label>
                             <textarea className="form-control bg-light border-0" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                          </div>
                       </div>
                    )}
                 </div>
                 <div className="modal-footer border-0 p-4 pt-0">
                    <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>إلغاء</button>
                    <button type="submit" className="btn btn-primary px-5 shadow-sm fw-bold" disabled={saving}>
                       {saving ? <div className="spinner-border spinner-border-sm me-2"></div> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                       {editItem ? 'حفظ التعديلات' : (view === 'subjects' ? 'إضافة المادة' : 'بدء الرفع')}
                    </button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .central-content-page { background: var(--bg-body); min-height: 100vh; }
        .page-hero { background: var(--primary); color: white; padding: 40px 20px; }
        .btn-back-circle { width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .btn-back-circle:hover { background: white; color: var(--primary); }
        .card-minimal { border: none; border-radius: 20px; background: white; transition: 0.3s; }
        .grade-icon { width: 60px; height: 60px; background: rgba(99,102,241,0.1); color: var(--primary); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .fw-black { font-weight: 900 !important; }
        .animate-in { animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .input-group-modern { display: flex; align-items: center; background: #f8f9fa; border-radius: 12px; padding: 5px 15px; border: 1.5px solid transparent; transition: 0.3s; }
        .input-group-modern:focus-within { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
        .input-icon { margin-left: 10px; color: var(--primary); }
        .form-control-modern { border: none; background: transparent; width: 100%; padding: 10px 0; outline: none; font-weight: 600; }
        
        .btn-indigo { background: #6366f1; color: white; border: none; }
        .btn-indigo:hover { background: #4f46e5; color: white; }
        .x-small { font-size: 11px; }
        .badge-type { background: rgba(99,102,241,0.08); color: var(--primary); padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
        .border-end-primary { border-right: 5px solid var(--primary); }
      `}</style>
    </div>
  );
};

export default CentralContent;
