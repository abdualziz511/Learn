import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faCity, faUsers, faChalkboardTeacher, 
  faGraduationCap, faServer, faMicrochip, faMemory, 
  faSyncAlt 
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SystemStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/stats');
      // res.data is the JSON { status: 'success', data: { totals: ... } }
      setData(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-primary"></div>
      </div>
    );
  }

  // Chart Data: Schools by City
  const cityData = {
    labels: (data.schoolsByCity || []).map(c => c.label || 'غير معروف'),
    datasets: [{
      label: 'عدد المدارس',
      data: (data.schoolsByCity || []).map(c => Number(c.value) || 0),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderWidth: 0,
      borderRadius: 8,
    }]
  };

  // Chart Data: Growth
  const growthData = {
    labels: (data.growth || []).map(g => g.label || ''),
    datasets: [{
      label: 'المستخدمين الجدد',
      data: (data.growth || []).map(g => Number(g.value) || 0),
      fill: true,
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointRadius: 4,
    }]
  };

  // Chart Data: Roles
  const rolesData = {
    labels: ['معلمين', 'طلاب', 'أولياء أمور', 'مدراء مدارس'],
    datasets: [{
      data: [
        Number(data.totals?.teachers) || 0,
        Number(data.totals?.students) || 0,
        Number(data.totals?.parents) || 0,
        Number(data.totals?.admins) || 0
      ],
      backgroundColor: [
        '#F59E0B',
        '#10B981',
        '#3B82F6',
        '#8B5CF6'
      ],
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="animate-in">
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h2 className="fw-black mb-1" style={{ fontFamily: 'Cairo' }}>إحصائيات النظام التحليلية</h2>
            <p className="text-white-50 mb-0">نظرة شاملة على أداء وموارد المنظومة التعليمية</p>
          </div>
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-2" onClick={fetchStats}>
            <FontAwesomeIcon icon={faSyncAlt} className={loading ? 'fa-spin' : ''} />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* Counter Cards */}
      <div className="row g-4 mb-4">
        {[
          { label: 'المدارس', value: data.totals?.schools || 0, icon: faCity, color: '#6366F1' },
          { label: 'المعلمين', value: data.totals?.teachers || 0, icon: faChalkboardTeacher, color: '#F59E0B' },
          { label: 'الطلاب', value: data.totals?.students || 0, icon: faGraduationCap, color: '#10B981' },
          { label: 'أولياء الأمور', value: data.totals?.parents || 0, icon: faUsers, color: '#3B82F6' },
        ].map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body p-4 position-relative">
                <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
                  <FontAwesomeIcon icon={stat.icon} size="5x" />
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 p-3 text-white" style={{ background: stat.color }}>
                    <FontAwesomeIcon icon={stat.icon} size="lg" />
                  </div>
                  <div>
                    <div className="text-muted small fw-bold">{stat.label}</div>
                    <h3 className="fw-black mt-1 mb-0">{stat.value.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Main Growth Chart */}
        <div className="col-md-8">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between">
              <h5 className="fw-bold mb-0">نمو قاعدة المستخدمين</h5>
              <div className="badge bg-primary bg-opacity-10 text-primary">آخر 6 أشهر</div>
            </div>
            <div className="card-body p-4" style={{ height: 300 }}>
              <Line data={growthData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4 text-center">
              <h5 className="fw-bold mb-0">توزيع المستخدمين</h5>
            </div>
            <div className="card-body p-4 d-flex flex-column align-items-center position-relative">
              <div style={{ height: 200, width: '100%' }}>
                <Doughnut 
                  data={rolesData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Cairo' } } } } 
                  }} 
                />
              </div>
              <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="text-muted small">إجمالي</div>
                <div className="fw-black h4 mb-0">
                  {(Number(data.totals?.teachers) || 0) + 
                   (Number(data.totals?.students) || 0) + 
                   (Number(data.totals?.parents) || 0) + 
                   (Number(data.totals?.admins) || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* City distribution */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">تواجد المدارس حسب المدن</h5>
            </div>
            <div className="card-body p-4" style={{ height: 250 }}>
              <Bar data={cityData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* System Load */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">حالة الخادم والضغط الفني</h5>
            </div>
            <div className="card-body p-4">
               <div className="row g-3">
                  {[
                    { label: 'استهلاك المعالج', value: data.systemStatus?.server_load || 0, icon: faMicrochip, color: 'info' },
                    { label: 'استهلاك الذاكرة', value: data.systemStatus?.memory_usage || 0, icon: faMemory, color: 'warning' },
                  ].map((sys, i) => (
                    <div className="col-12" key={i}>
                      <div className="d-flex justify-content-between mb-1">
                         <span className="small fw-bold">{sys.label}</span>
                         <span className="small fw-black">{sys.value}%</span>
                      </div>
                      <div className="progress" style={{ height: 10, borderRadius: 5 }}>
                         <div className={`progress-bar bg-${sys.color}`} style={{ width: `${sys.value}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
               
               <div className="mt-4 pt-3 divider"></div>
               
               <div className="row text-center mt-3">
                  <div className="col-6 border-end">
                    <div className="text-muted small">مدة التشغيل</div>
                    <div className="fw-black text-primary">{data.systemStatus?.uptime || '—'}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">الجلسات النشطة</div>
                    <div className="fw-black text-success">{data.systemStatus?.active_sessions || 0}</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
