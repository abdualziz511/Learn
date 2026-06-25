import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faUsers, faSave, faFilter, faCheckCircle,
  faTriangleExclamation, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const GradeSubmission = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('monthly'); // monthly, final, homework
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const res = await axiosInstance.get('/teacher/meta');
      setClasses(res.data?.classes || [
         { id: 1, name: 'السابع (أ)' },
         { id: 2, name: 'السابع (ب)' }
      ]);
      setSubjects(res.data?.subjects || [
         { id: 101, name: 'الرياضيات' }
      ]);
    } catch (e) { console.error(e); }
  };

  const loadStudents = async () => {
    if (!selectedClass || !selectedSubject) return;
    setLoading(true);
    try {
      // Simulate/Fetch students for the class
      const res = await axiosInstance.get(`/teacher/students?class_id=${selectedClass}`);
      setStudents(res.data?.data?.map(s => ({ ...s, score: 0, max_score: 20 })) || [
         { id: 1, name: 'أحمد محمود علي', score: 18, max_score: 20 },
         { id: 2, name: 'سارة خالد جابر', score: 19, max_score: 20 },
      ]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleScoreChange = (id, score) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, score } : s));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axiosInstance.post('/teacher/grades/submit', {
        class_id: selectedClass,
        subject_id: selectedSubject,
        exam_type: examType,
        grades: students.map(s => ({ student_id: s.id, score: s.score, max_score: s.max_score }))
      });
      Swal.fire({
        title: 'تم الإرسال',
        text: 'تم إرسال الدرجات لمدير المدرسة للاعتماد بنجاح',
        icon: 'success'
      });
    } catch (e) {
      Swal.fire('خطأ', 'فشل في إرسال الدرجات', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>رصد درجات الاختبارات</h2>
            <p className="mb-0 opacity-80 small">إدخال درجات الاختبارات الشهرية والنهائية لرفعها للإدارة</p>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select border-0 shadow-sm" style={{ width: 150 }} value={examType} onChange={(e)=>setExamType(e.target.value)}>
               <option value="monthly">اختبار شهري</option>
               <option value="homework">أعمال سنة</option>
               <option value="final">اختبار نهائي</option>
            </select>
            <select className="form-select border-0 shadow-sm" value={selectedClass} onChange={(e)=>setSelectedClass(e.target.value)}>
               <option value="">الفصل...</option>
               {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn btn-white text-primary fw-bold" onClick={loadStudents} disabled={!selectedClass}>
              عرض الطلاب
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : students.length > 0 ? (
        <div className="animate-in">
           <div className="card shadow-sm border-0 overflow-hidden mb-4">
              <div className="table-responsive">
                 <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light small">
                       <tr>
                          <th className="ps-4">الطالب</th>
                          <th className="text-center">الدرجة</th>
                          <th className="text-center">من</th>
                          <th>ملاحظات</th>
                       </tr>
                    </thead>
                    <tbody>
                       {students.map(s => (
                          <tr key={s.id}>
                             <td className="ps-4">
                                <div className="d-flex align-items-center gap-2">
                                   <FontAwesomeIcon icon={faUserGraduate} className="text-muted" />
                                   <div className="fw-bold">{s.name}</div>
                                </div>
                             </td>
                             <td className="text-center">
                                <input 
                                   type="number" 
                                   className="form-control form-control-sm mx-auto fw-bold text-center" 
                                   style={{ width: 80, border: '1px solid #eee' }} 
                                   value={s.score}
                                   onChange={(e) => handleScoreChange(s.id, e.target.value)}
                                />
                             </td>
                             <td className="text-center text-muted fw-bold">/ {s.max_score}</td>
                             <td>
                                <input type="text" className="form-control form-control-sm border-0 bg-light" placeholder="مثال: تحسن ملحوظ" />
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="alert alert-warning py-3 d-flex align-items-center gap-3">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <div className="small">
                 بمجرد النقر على "إرسال واعتماد"، سيتم إغلاق التعديل وإرسال الدرجات للمدير. لن تظهر للطلاب إلا بعد موافقة الإدارة.
              </div>
           </div>

           <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-primary px-5 py-3 d-flex align-items-center gap-2" onClick={handleSubmit} disabled={saving}>
                 {saving ? <div className="spinner-border spinner-border-sm"></div> : <FontAwesomeIcon icon={faCheckCircle} />}
                 <span>إرسال النتائج للإدارة</span>
              </button>
           </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0 p-5 text-center text-muted opacity-50">
           <FontAwesomeIcon icon={faStar} size="4x" className="mb-3" />
           <h5>اختر الفصل والمادة لبدء رصد الدرجات</h5>
        </div>
      )}
    </div>
  );
};

export default GradeSubmission;
