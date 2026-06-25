import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardTeacher, faSchool, faUsers, faBookOpen,
  faCalendarCheck, faChartLine, faClock, faStar,
  faTriangleExclamation, faLightbulb, faBrain, faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="card h-100 border-0 shadow-sm transition-hover rounded-4">
    <div className="card-body p-4 d-flex align-items-center gap-3">
      <div className="stat-icon-box shadow-sm" style={{ background: bg, color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div className="text-muted small fw-bold">{label}</div>
        <div className="h4 fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>{value}</div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [data, setData] = useState({
    stats: { schools_count: 0, classes_count: 0, students_count: 0, subjects_count: 0, teacher_name: '' },
    schedule: [],
    recommendations: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get('/teacher/dashboard');
        if (res.data?.status === 'success') {
          setData(res.data.data);
        } else {
          setError(res.data?.message || 'فشل جلب البيانات');
        }
      } catch (e) {
        console.error(e);
        setError('حدث خطأ أثناء الاتصال بالخادم (404/500)');
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-5 d-flex flex-column align-items-center gap-3"><div className="spinner-border text-primary"></div><p>جاري جلب بياناتك الحقيقية من قاعدة البيانات...</p></div>;

  if (error) return (
    <div className="container py-5 text-center">
       <div className="alert alert-danger rounded-4 py-4 shadow-sm">
          <FontAwesomeIcon icon={faTriangleExclamation} size="3x" className="mb-3" />
          <h5 className="fw-bold">عذراً، فشل تحميل البيانات</h5>
          <p className="mb-0">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-outline-danger mt-3 rounded-pill px-4">إعادة المحاولة</button>
       </div>
    </div>
  );

  return (
    <div className="animate-in">
      {/* Hero Welcome Section */}
      <div className="page-hero mb-4 rounded-4 shadow-sm text-white position-relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '40px' }}>
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, letterSpacing: 1 }} className="mb-2 uppercase fw-bold">بوابة المعلم الذكية</div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>أهلاً بك، {data.stats.teacher_name}</h2>
            <p className="mb-0 opacity-80 small">لديك إجمالي {data.schedule.length} مهام تدريسية مسندة في {data.stats.schools_count} مدرسة مختلفة.</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: 80, height: 80 }}>
             <FontAwesomeIcon icon={faChalkboardTeacher} size="2x" className="text-primary-light" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4" style={{ direction: 'rtl' }}>
        <div className="col-md-3">
          <StatCard icon={faSchool} label="المدارس المرتبطة" value={data.stats.schools_count} color="#6366F1" bg="rgba(99,102,241,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faUsers} label="إجمالي الطلاب" value={data.stats.students_count} color="#10B981" bg="rgba(16,185,129,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faBookOpen} label="المواد المسندة" value={data.stats.subjects_count} color="#F59E0B" bg="rgba(245,158,11,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faCalendarCheck} label="الصفوف الدراسية" value={data.stats.classes_count} color="#EF4444" bg="rgba(239,68,68,0.1)" />
        </div>
      </div>

      <div className="row g-4" style={{ direction: 'rtl' }}>
        {/* Main Content: Schedule/Assignments */}
        <div className="col-lg-8 text-end">
            <div className="card h-100 border-0 shadow-sm rounded-4">
               <div className="card-header bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold px-2"><FontAwesomeIcon icon={faClock} className="ms-2 text-primary" /> قائمة المهام والصفوف المسندة</h6>
               </div>
               <div className="card-body p-0">
                  <div className="table-responsive">
                     <table className="table table-hover align-middle mb-0 text-end">
                        <thead className="bg-light small">
                           <tr>
                              <th className="pr-4 py-3">المدرسة</th>
                              <th>الصف الدراسي</th>
                              <th>المادة التعليمية</th>
                              <th className="text-center">إجراءات</th>
                           </tr>
                        </thead>
                        <tbody>
                           {data.schedule.length > 0 ? data.schedule.map(item => (
                              <tr key={item.id}>
                                 <td className="pr-4">
                                    <div className="fw-bold text-dark">{item.school_name}</div>
                                 </td>
                                 <td>
                                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3">{item.grade_name} - {item.class_name}</span>
                                 </td>
                                 <td>
                                    <div className="d-flex align-items-center gap-2 justify-content-end">
                                       <span className="fw-bold" style={{ color: item.color || '#000' }}>{item.subject_name}</span>
                                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || '#ccc' }}></div>
                                    </div>
                                 </td>
                                 <td className="text-center">
                                    <div className="d-flex gap-2 justify-content-center">
                                       <Link to={`/teacher/attendance?school=${item.school_id}&class=${item.class_id}&subject=${item.subject_id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">متابعة التكاليف</Link>
                                       <Link to={`/teacher/grades?school=${item.school_id}&class=${item.class_id}&subject=${item.subject_id}`} className="btn btn-sm btn-light rounded-pill px-3">رصد الدرجات</Link>
                                    </div>
                                 </td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan="4" className="text-center py-5 text-muted">لا توجد مهام مسندة حالياً</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
        </div>

        {/* Sidebar: AI & Alerts */}
        <div className="col-lg-4 text-end">
            {/* AI Recommendations */}
            {data.recommendations.map((rec, i) => (
               <div key={i} className="card border-0 shadow-sm mb-4 rounded-4" style={{ background: 'linear-gradient(to bottom left, #ffffff, #f8faff)' }}>
                  <div className="card-body p-4">
                     <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
                        <h6 className="fw-bold mb-0">{rec.title}</h6>
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><FontAwesomeIcon icon={faBrain} /></div>
                     </div>
                     <p className="small text-muted mb-4 lh-lg">"{rec.body}"</p>
                     <Link to="/teacher/content" className="btn btn-sm btn-primary w-100 py-2 rounded-pill shadow-sm">عرض المراجع الموصى بها</Link>
                  </div>
               </div>
            ))}

            {/* Administrative Notifications */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
               <div className="card-header bg-transparent py-3 border-bottom">
                  <h6 className="mb-0 fw-bold">التنبيهات الإدارية</h6>
               </div>
               <div className="card-body p-0">
                  {data.alerts.length > 0 ? data.alerts.map((alert, i) => (
                     <div key={i} className="p-3 border-bottom d-flex gap-3 hover-bg-light transition-all">
                        <div className={`mt-1 ${alert.type === 'warning' ? 'text-warning' : 'text-primary'}`}>
                           <FontAwesomeIcon icon={alert.type === 'warning' ? faTriangleExclamation : faLightbulb} />
                        </div>
                        <div className="small text-secondary fw-medium">{alert.body}</div>
                     </div>
                  )) : (
                     <div className="p-4 text-center text-muted small">لا توجد تنبيهات جديدة</div>
                  )}
                  <button className="btn btn-link btn-sm w-100 text-decoration-none py-3 text-primary fw-bold">عرض كافة الإشعارات</button>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
