import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faUsers, faChalkboardTeacher, faGraduationCap,
  faChartBar, faArrowTrendUp, faCalendarCheck, faBell
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  BarElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axiosInstance from '../../api/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ icon, label, value, color, bg, trend }) => (
  <div className="card h-100 border-0 shadow-sm">
    <div className="card-body d-flex align-items-center gap-3">
      <div className="stat-icon-box" style={{ background: bg, color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div className="text-muted small fw-bold">{label}</div>
        <div className="h4 fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>{value}</div>
        {trend && <div className="text-success small"><FontAwesomeIcon icon={faArrowTrendUp} /> {trend}</div>}
      </div>
    </div>
  </div>
);

const SchoolAdminDashboard = () => {
  const [stats, setStats] = useState({ 
    students_count: 0, 
    teachers_count: 0, 
    classes_count: 0, 
    attendance_rate: '0%' 
  });
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [schoolRes, statsRes] = await Promise.all([
          axiosInstance.get('/school-admin/school'),
          axiosInstance.get('/school-admin/stats?action=overview')
        ]);
        setSchoolInfo(schoolRes.data?.data);
        setStats(statsRes.data?.data);
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-5 text-center"><div className="spinner-primary mx-auto"></div></div>;

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>نظام إدارة المدرسة</div>
            <h2 className="fw-900" style={{ fontFamily: 'Cairo' }}>{schoolInfo?.name || 'لوحة تحكم المدير'}</h2>
            <p className="mb-0 opacity-80 small">مرحباً بك مجدداً في نظام إدارة مدرستك الذكية</p>
          </div>
          <div className="avatar-lg bg-white bg-opacity-10">
             <FontAwesomeIcon icon={faBuilding} size="2x" />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon={faGraduationCap} label="إجمالي الطلاب" value={stats.students_count} color="#6366F1" bg="rgba(99,102,241,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faChalkboardTeacher} label="المعلمين" value={stats.teachers_count} color="#10B981" bg="rgba(16,185,129,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faCalendarCheck} label="نسبة الحضور للشهر" value={stats.attendance_rate} color="#F59E0B" bg="rgba(245,158,11,0.1)" />
        </div>
        <div className="col-md-3">
          <StatCard icon={faBuilding} label="الفصول الدراسية" value={stats.classes_count} color="#EF4444" bg="rgba(239,68,68,0.1)" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
           <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
                 <h6 className="mb-0 fw-bold">نظرة عامة على التحصيل الدراسي</h6>
                 <Link to="/admin/stats" className="btn btn-sm btn-light">عرض التفاصيل</Link>
              </div>
              <div className="card-body">
                 {stats.grades_performance?.length > 0 ? (
                    <div style={{ height: '300px' }}>
                       <Bar 
                          data={{
                             labels: stats.grades_performance.map(g => g.grade),
                             datasets: [{
                                label: 'متوسط الدرجات',
                                data: stats.grades_performance.map(g => g.average),
                                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                borderRadius: 5
                             }]
                          }}
                          options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }}
                       />
                    </div>
                 ) : (
                    <div className="text-center py-5 opacity-30">
                       <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-2" />
                       <div>لا توجد بيانات متاحة حالياً للعرض</div>
                    </div>
                 )}
              </div>
           </div>
        </div>
        <div className="col-lg-4">
           <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent py-3">
                 <h6 className="mb-0 fw-bold">إجراءات سريعة</h6>
              </div>
              <div className="card-body">
                 <div className="d-grid gap-2">
                    <Link to="/admin/students" className="btn btn-outline-primary text-start p-3 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
                       <FontAwesomeIcon icon={faGraduationCap} /> إضافة طالب جديد
                    </Link>
                    <Link to="/admin/attendance" className="btn btn-outline-success text-start p-3 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
                       <FontAwesomeIcon icon={faCalendarCheck} /> مراجعة الغياب اليومي
                    </Link>
                    <Link to="/admin/teachers" className="btn btn-outline-info text-start p-3 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
                       <FontAwesomeIcon icon={faChalkboardTeacher} /> تعيين معلم جديد
                    </Link>
                 </div>
              </div>
           </div>
           
           <div className="card border-0 shadow-sm bg-primary text-white" style={{ borderRadius: 15 }}>
              <div className="card-body p-4 text-start">
                 <h6 className="fw-bold mb-3">ذكاء النظام 🧠</h6>
                 <p className="small mb-0" style={{ opacity: 0.9 }}>
                    بناءً على البيانات الفعلية، يمكنك متابعة نقاط الضعف في المواد والصفوف عبر صفحة الإحصائيات لاتخاذ القرارات التربوية المناسبة.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
