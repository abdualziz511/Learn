import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate, faBrain, faChartBar, faBookReader,
  faTasks, faCalendarAlt, faStar, faRocket,
  faArrowRight, faCircleCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get('/student/dashboard');
      setData(res.data?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ai = data?.ai_insights;

  return (
    <div className="animate-in">
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>بوابة الطالب الذكية</div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>أهلاً بك، {user.name || 'طالبنا العزيز'}!</h2>
            <p className="mb-0 opacity-80 small">يسعدنا رؤية نشاطك التعليمي المستمر اليوم.</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
             <FontAwesomeIcon icon={faRocket} size="xl" />
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
           {/* AI Assessment Card */}
           <div className="card border-0 shadow-lg overflow-hidden mb-4" style={{ borderRadius: '24px' }}>
              <div className="card-body p-0">
                 <div className="row g-0">
                    <div className="col-md-5 p-4 bg-indigo-900 text-white d-flex flex-column justify-content-center" style={{ background: '#2e1065' }}>
                       <div className="d-flex align-items-center gap-2 mb-3">
                          <FontAwesomeIcon icon={faBrain} className="text-warning" />
                          <h5 className="fw-bold mb-0 text-white">تقييم الذكاء الاصطناعي</h5>
                       </div>
                       <div className="text-center my-4">
                          <div className="display-4 fw-900 mb-0">{ai?.risk_level ? (100 - ai.risk_level) : '--'}%</div>
                          <div className="small opacity-70">مستوى الأداء العام</div>
                       </div>
                       <div className="progress bg-white bg-opacity-10" style={{ height: 8 }}>
                          <div className="progress-bar bg-warning" style={{ width: `${ai?.risk_level ? (100 - ai.risk_level) : 0}%` }}></div>
                       </div>
                    </div>
                    <div className="col-md-7 p-4 bg-white">
                       <h6 className="fw-bold mb-3">تحليل المسار التعليمي</h6>
                       {loading ? (
                          <div className="placeholder-glow">
                             <span className="placeholder col-12 mb-2"></span>
                             <span className="placeholder col-10 mb-2"></span>
                             <span className="placeholder col-8"></span>
                          </div>
                       ) : (
                          <div className="animate-in text-end" style={{ direction: 'rtl' }}>
                             <p className="small text-muted mb-4">{ai?.recommendations?.[0] || 'لم نجمع بيانات كافية بعد لتحليل مستواك بدقة، استمر في حل الواجبات والاختبارات لنمنحك توصيات ذكية.'}</p>
                             <div className="row g-2 mb-4 text-start">
                                <div className="col-6">
                                   <div className="p-2 border rounded-3 bg-light text-end">
                                      <div className="x-small fw-bold text-success mb-1">نقاط القوة</div>
                                      <div className="small fw-bold">{ai?.strong_subjects?.length > 0 ? ai.strong_subjects.join(', ') : '---'}</div>
                                   </div>
                                </div>
                                <div className="col-6">
                                   <div className="p-2 border rounded-3 bg-light text-end">
                                      <div className="x-small fw-bold text-danger mb-1">تحتاج لتركيز</div>
                                      <div className="small fw-bold">{ai?.weak_subjects?.length > 0 ? ai.weak_subjects.join(', ') : '---'}</div>
                                   </div>
                                </div>
                             </div>
                             <Link to="/student/subjects" className="btn btn-outline-primary btn-sm w-100 rounded-pill">
                                عرض خطة التحسين الموصى بها <FontAwesomeIcon icon={faArrowRight} className="ms-1" size="xs" />
                             </Link>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="row g-3">
              <div className="col-md-6">
                 <div className="card h-100 border-0 shadow-sm transition-hover">
                    <div className="card-body p-4 text-end" style={{ direction: 'rtl' }}>
                       <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="avatar bg-primary bg-opacity-10 text-primary">
                             <FontAwesomeIcon icon={faTasks} />
                          </div>
                          <Link to="/student/assignments" className="btn btn-icon btn-light btn-sm"><FontAwesomeIcon icon={faArrowRight} /></Link>
                       </div>
                       <h6 className="fw-bold">التكاليف والواجبات</h6>
                       <p className="small text-muted mb-0">لديك {data?.upcoming_assignments?.length || 0} واجبات بانتظار التسليم.</p>
                    </div>
                 </div>
              </div>
              <div className="col-md-6">
                 <div className="card h-100 border-0 shadow-sm transition-hover">
                    <div className="card-body p-4 text-end" style={{ direction: 'rtl' }}>
                       <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="avatar bg-success bg-opacity-10 text-success">
                             <FontAwesomeIcon icon={faBookReader} />
                          </div>
                          <Link to="/student/subjects" className="btn btn-icon btn-light btn-sm"><FontAwesomeIcon icon={faArrowRight} /></Link>
                       </div>
                       <h6 className="fw-bold">المواد الدراسية</h6>
                       <p className="small text-muted mb-0">تصفح الكتب، الملخصات، والمصادر الإثرائية لموادك.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-lg-4">
           {/* Recent Grades/Activity */}
           <div className="card border-0 shadow-sm mb-4 h-100">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">آخر النتائج المحققة</h6>
              </div>
              <div className="card-body p-0">
                 {loading ? (
                    <div className="p-5 text-center"><div className="spinner-primary mx-auto"></div></div>
                 ) : data?.recent_grades?.length > 0 ? (
                    data.recent_grades.map((g, i) => (
                      <div key={i} className="p-3 border-bottom d-flex align-items-center justify-content-between text-end" style={{ direction: 'rtl' }}>
                         <div className="d-flex align-items-center gap-2">
                            <div className="avatar sm bg-success bg-opacity-10 text-success" style={{ width: 32, height: 32 }}>
                               <FontAwesomeIcon icon={faStar} size="xs" />
                            </div>
                            <div>
                               <div className="fw-bold small">{g.subject_name}</div>
                               <div className="x-small text-muted">{g.grade_type}</div>
                            </div>
                         </div>
                         <div className="fw-bold text-primary">{g.score} / {g.max_score}</div>
                      </div>
                    ))
                 ) : (
                    <div className="p-5 text-center opacity-50">
                       <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3" />
                       <p className="small">لا توجد نتائج معتمدة حالياً.</p>
                    </div>
                 )}
                 <div className="p-4 text-center">
                    <Link to="/student/grades" className="btn btn-sm btn-light w-100">عرض كافة النتائج</Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
