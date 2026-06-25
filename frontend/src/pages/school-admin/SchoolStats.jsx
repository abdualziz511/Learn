import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, faChartLine, faChartBar, faUserGraduate, 
  faCalendarCheck, faExclamationTriangle, faFilter, faSync,
  faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { 
  Chart as ChartJS, 
  CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, 
  Legend, ArcElement 
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend
);

const SchoolStats = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [gradeStats, setGradeStats] = useState(null);
  const [gradeLoading, setGradeLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Overview
      const ovRes = await axiosInstance.get('/school-admin/stats?action=overview');
      setOverview(ovRes.data?.data);

      // 2. Fetch Grade Levels for the filter
      const gradesRes = await axiosInstance.get('/school-admin/grade-levels');
      setGradeLevels(gradesRes.data?.data || []);
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'خطأ', text: 'فشل تحميل الإحصائيات', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeStats = async (levelId) => {
    setGradeLoading(true);
    try {
      const res = await axiosInstance.get(`/school-admin/stats?action=grade&level_id=${levelId}`);
      setGradeStats(res.data?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGradeLoading(false);
    }
  };

  const handleGradeChange = (levelId) => {
    setSelectedGrade(levelId);
    if (levelId) fetchGradeStats(levelId);
    else setGradeStats(null);
  };

  // Chart Options & Data
  const performanceChartData = {
    labels: overview?.grades_performance?.map(g => g.grade) || [],
    datasets: [{
      label: 'متوسط الدرجات',
      data: overview?.grades_performance?.map(g => g.average) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366F1',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const sectionPerformanceData = {
    labels: gradeStats?.sections?.map(s => s.section) || [],
    datasets: [{
      label: 'أداء الشعب الدراسية',
      data: gradeStats?.sections?.map(s => s.average) || [],
      backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0,
      borderRadius: 5
    }]
  };

  const attendanceChartData = {
    labels: gradeStats?.attendance_by_section?.map(s => s.section) || [],
    datasets: [{
      label: 'نسبة الحضور (%)',
      data: gradeStats?.attendance_by_section?.map(s => s.rate) || [],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-primary mx-auto"></div></div>;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>إحصائيات وذكاء المدرسة</h2>
            <p className="opacity-80 mb-0 small">تحليل المخرجات التعليمية، الغياب، ومؤشرات الأداء الدراسي</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-white btn-sm rounded-pill px-3 shadow-sm" onClick={fetchInitialData}>
              <FontAwesomeIcon icon={faSync} className="me-2 text-primary" /> تحديث البيانات
            </button>
            <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
              <FontAwesomeIcon icon={faChartPie} size="xl" />
            </div>
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        {[
          { icon: faUserGraduate, label: 'إجمالي الطلاب', value: overview?.students_count, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
          { icon: faCalendarCheck, label: 'نسبة الحضور العام', value: overview?.attendance_rate, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { icon: faChartPie, label: 'الفصول الدراسية', value: overview?.classes_count, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { icon: faExclamationTriangle, label: 'نقاط الضعف المكتشفة', value: gradeStats?.weak_subjects?.length || 0, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon-box" style={{ background: stat.bg, color: stat.color }}>
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div>
                  <div className="text-muted small fw-bold">{stat.label}</div>
                  <div className="h4 fw-900 mb-0">{stat.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Main Performance Chart */}
        <div className="col-lg-8">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-transparent py-3">
              <h6 className="mb-0 fw-bold">الأداء الدراسي حسب المراحل (متوسط الدرجات)</h6>
            </div>
            <div className="card-body">
              <Bar 
                data={performanceChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, max: 100 } }
                }} 
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Grade Selection Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3 d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-primary" />
              <h6 className="mb-0 fw-bold">تحليل مرحلة محددة</h6>
            </div>
            <div className="card-body">
              <label className="form-label small text-muted">اختر الصف الدراسي للمعاينة</label>
              <select 
                className="form-select mb-4 py-2" 
                value={selectedGrade || ''} 
                onChange={(e) => handleGradeChange(e.target.value)}
              >
                <option value="">-- اختر الصف --</option>
                {gradeLevels.map(gl => (
                  <option key={gl.id} value={gl.id}>{gl.name}</option>
                ))}
              </select>

              {selectedGrade ? (
                gradeLoading ? <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div> : (
                  <div className="animate-in">
                    <div className="p-3 rounded-4 bg-light mb-3">
                      <div className="small text-muted mb-1">أفضل شعبة أداءً</div>
                      <div className="fw-900 text-success">
                        {gradeStats?.sections?.sort((a,b) => b.average - a.average)[0]?.section || '--'}
                      </div>
                    </div>
                    <div className="p-3 rounded-4 bg-light">
                      <div className="small text-muted mb-1">نقاط الضعف (مواد تحت الـ 60%)</div>
                      {gradeStats?.weak_subjects?.length > 0 ? (
                        <div className="mt-2">
                          {gradeStats.weak_subjects.map((s, i) => (
                            <div key={i} className="d-flex justify-content-between small mb-1">
                              <span className="text-danger fw-bold">{s.subject}</span>
                              <span className="text-muted">{s.average}%</span>
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-success small">لا توجد مواد ضعيفة</div>}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-5 opacity-50">
                  <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3" />
                  <p className="small">يرجى اختيار صف دراسي لعرض التحليلات التفصيلية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedGrade && gradeStats && (
        <div className="row g-4 animate-in">
          {/* Section Performance Comparison */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-bold">تحصيل الشعب الدراسية لمرحلة {gradeLevels.find(g => String(g.id) === String(selectedGrade))?.name}</h6>
              </div>
              <div className="card-body">
                <Doughnut 
                  data={sectionPerformanceData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom' } }
                  }}
                  height={250}
                />
              </div>
            </div>
          </div>

          {/* Attendance Line Chart */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-bold">نسبة انضباط الحضور والغياب (حسب الشعبة)</h6>
              </div>
              <div className="card-body">
                <Line 
                  data={attendanceChartData}
                  options={{
                    scales: { y: { min: 0, max: 100 } },
                    maintainAspectRatio: false
                  }}
                  height={250}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolStats;
