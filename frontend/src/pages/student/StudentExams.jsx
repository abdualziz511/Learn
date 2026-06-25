import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardCheck, faPlay, faHistory, faStar,
  faClock, faInfoCircle, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosInstance.get('/student/exams');
        setExams(res.data?.data || [
           { id: 1, title: 'اختبار نصف الفصل - رياضيات', subject: 'الرياضيات', duration: '45 دقيقة', status: 'available', questions: 20 },
           { id: 2, title: 'تقييم مفاهيم الفيزياء', subject: 'الفيزياء', duration: '30 دقيقة', status: 'completed', score: '18/20' },
           { id: 3, title: 'اختبار الأدب العربي', subject: 'اللغة العربية', duration: '60 دقيقة', status: 'available', questions: 30 },
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchExams();
  }, []);

  const handleStartExam = (exam) => {
     Swal.fire({
        title: 'تنبيه البدء',
        text: `هل أنت مستعد لبدء اختبار ${exam.title}؟ الوقت المتاح هو ${exam.duration}. لن تستطيع التوقف بمجرد البدء.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'نعم، ابدأ الآن',
        cancelButtonText: 'إلغاء'
     });
  };

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}>
        <div>
          <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>الاختبارات والتقييمات</h2>
          <p className="mb-0 opacity-80 small">أدّ اختباراتك الشهرية وتطلع على نتائجك وتقييماتك مباشرة</p>
        </div>
      </div>

      <div className="row g-4">
         <div className="col-lg-8">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
               <FontAwesomeIcon icon={faPlay} className="text-primary small" /> الاختبارات المتاحة
            </h6>
            {loading ? (
               <div className="text-center py-5"><div className="spinner-primary"></div></div>
            ) : (
               <div className="row g-3 animate-in">
                  {exams.filter(e => e.status === 'available').map(e => (
                     <div className="col-12" key={e.id}>
                        <div className="card shadow-sm border-0 transition-hover">
                           <div className="card-body p-4 d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-3">
                                 <div className="avatar bg-primary bg-opacity-10 text-primary">
                                    <FontAwesomeIcon icon={faClipboardCheck} />
                                 </div>
                                 <div>
                                    <h6 className="fw-bold mb-1">{e.title}</h6>
                                    <div className="text-muted x-small d-flex gap-3">
                                       <span>{e.subject}</span>
                                       <span><FontAwesomeIcon icon={faClock} className="me-1" /> {e.duration}</span>
                                       <span>{e.questions} سؤال</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => handleStartExam(e)} className="btn btn-primary px-4 rounded-pill">ابدأ الاختبار</button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <div className="col-lg-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
               <FontAwesomeIcon icon={faHistory} className="text-muted small" /> السجل والنتائج
            </h6>
            <div className="card border-0 shadow-sm overflow-hidden">
               <div className="card-body p-0">
                  {exams.filter(e => e.status === 'completed').map(e => (
                     <div key={e.id} className="p-3 border-bottom d-flex align-items-center justify-content-between">
                        <div>
                           <div className="fw-bold small">{e.title}</div>
                           <div className="x-small text-muted">{e.subject}</div>
                        </div>
                        <div className="text-end">
                           <div className="fw-bold text-success">{e.score}</div>
                           <div className="x-small text-muted text-decoration-underline" style={{ cursor: 'pointer' }}>عرض الإجابات</div>
                        </div>
                     </div>
                  ))}
                  {exams.filter(e => e.status === 'completed').length === 0 && (
                     <div className="p-4 text-center text-muted small">لا يوجد نتائج سابقة</div>
                  )}
               </div>
            </div>
            
            <div className="card border-0 shadow-sm mt-4 bg-light">
               <div className="card-body p-3">
                  <div className="d-flex gap-2">
                     <FontAwesomeIcon icon={faInfoCircle} className="text-info mt-1" />
                     <div className="x-small text-muted">سيتم رصد الدرجات تلقائياً بعد الإكمال، وتظهر النتيجة النهائية بعد اعتماد المعلم للإجابات المقالية (إن وجدت).</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentExams;
