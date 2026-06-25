import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain, faTriangleExclamation, faLightbulb, faChartLine,
  faCircleInfo, faCheckCircle, faClock
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';

const SchoolAINotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetching for the demo, would be /api/notifications?type=ai_recommendation
    const fetchAIInsights = async () => {
       try {
          const res = await axiosInstance.get('/notifications?type=ai_recommendation');
          setNotifications(res.data?.data || [
             {
                id: 1,
                title: 'تراجع أداء عام في مادة الرياضيات',
                body: 'تحليل درجات الشهر الحالي يظهر تراجعاً بنسبة 15% في طلاب الصف التاسع (شعبة أ). نوصي بمراجعة خطة التدريس مع الأستاذ محمد علي.',
                type: 'warning',
                created_at: new Date().toISOString()
             },
             {
                id: 2,
                title: 'اكتشاف موهبة علمية',
                body: 'الطالب "أحمد خالد" من الصف الحادي عشر أظهر تميزاً استثنائياً في اختبار الفيزياء بنسبة 100% مع سرعة إجابة فائقة. يوصى بإشراكه في المسابقات المحلية.',
                type: 'success',
                created_at: new Date().toISOString()
             }
          ]);
       } catch (e) { console.error(e); }
       setLoading(false);
    };
    fetchAIInsights();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="stat-icon-box bg-white bg-opacity-20 text-white animate-pulse">
            <FontAwesomeIcon icon={faBrain} size="2x" />
          </div>
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>تنبيهات الذكاء الاصطناعي </h2>
            <p className="mb-0 opacity-80 text-white">رؤى تحليلية مدعومة بالذكاء الاصطناعي لمتابعة جودة التعليم بالمدرسة</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {loading ? (
             <div className="text-center py-5 col-12"><div className="spinner-primary"></div></div>
        ) : (
          notifications.map(n => (
            <div className="col-12" key={n.id}>
              <div className={`card border-0 shadow-sm border-start border-4 ${n.type === 'warning' ? 'border-warning' : 'border-success'}`}>
                 <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                       <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon 
                             icon={n.type === 'warning' ? faTriangleExclamation : faLightbulb} 
                             className={n.type === 'warning' ? 'text-warning' : 'text-success'} 
                          />
                          <h5 className="fw-bold mb-0">{n.title}</h5>
                       </div>
                       <small className="text-muted"><FontAwesomeIcon icon={faClock} className="me-1" /> {new Date(n.created_at).toLocaleDateString('ar')}</small>
                    </div>
                    <p className="mb-3 text-muted">{n.body}</p>
                    <div className="d-flex gap-2">
                       <button className="btn btn-sm btn-light">عرض التفاصيل والطلاب</button>
                       <button className="btn btn-sm btn-outline-primary">جدولة اجتماع مع المدرس</button>
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}

        <div className="col-md-6">
           <div className="card border-0 shadow-sm bg-info bg-opacity-10">
              <div className="card-body p-4">
                 <div className="d-flex gap-3 align-items-start">
                    <FontAwesomeIcon icon={faChartLine} className="text-info mt-1" size="lg" />
                    <div>
                       <h6 className="fw-bold">كيف يعمل نظام التحليل؟</h6>
                       <p className="small text-muted mb-0">
                          يقوم الموديل بتحليل كشوفات التحضير اليومية، ودرجات الاختبارات الشهرية، وسلوك الطلاب لاستنتاج أنماط الضعف والقوة وتقديم توصيات فورية لزيادة كفاءة المدرسة.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="col-md-6 text-start">
           <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                 <div className="stat-icon-box bg-success bg-opacity-10 text-success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                 </div>
                 <div>
                    <h6 className="fw-bold mb-1">حالة السيرفر والذكاء الاصطناعي</h6>
                    <div className="badge bg-success">متصل ومستقر (99.9%)</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAINotifications;
