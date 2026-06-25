import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCity, faUsers, faChalkboardTeacher, faGraduationCap,
  faPlus, faArrowTrendUp, faServer, faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon, label, value, color, bg, trend, to }) => (
  <div className="card stat-card h-100" style={{ cursor: to ? 'pointer' : 'default' }}>
    <div className="card-body d-flex align-items-start gap-3" style={{ padding: '1.4rem' }}>
      <div className="stat-icon-box" style={{ background: bg, color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="flex-grow-1">
        <div className="text-muted" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Cairo, sans-serif', lineHeight: 1.2, marginTop: 4 }}>
          {value ?? '…'}
        </div>
        {trend && (
          <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
            <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
            {trend}
          </div>
        )}
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon, label, color, bg }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="card h-100" style={{ cursor: 'pointer', border: `1.5px solid ${color}20 !important` }}>
      <div className="card-body text-center" style={{ padding: '1.5rem 1rem' }}>
        <div className="mx-auto mb-3" style={{
          width: 50, height: 50, borderRadius: 14, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontSize: '1.2rem'
        }}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>{label}</div>
      </div>
    </div>
  </Link>
);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ schools: 0, students: 0, teachers: 0, users: 0 });
  const [recentSchools, setRecentSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes] = await Promise.all([
          axiosInstance.get('/super-admin/schools'),
        ]);
        const schools = schoolsRes.data?.data || [];
        setRecentSchools(schools.slice(0, 5));
        setStats(prev => ({ ...prev, schools: schoolsRes.data?.pagination?.total ?? schools.length }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="page-hero mb-4">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6, fontWeight: 500 }}>لوحة تحكم المدير العام</div>
          <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: '1.75rem', margin: 0 }}>
            نظام الإدارة المدرسية المركزي
          </h2>
          <p style={{ opacity: 0.8, marginTop: 8, marginBottom: 0 }}>
            إدارة شاملة لجميع المدارس والمستخدمين والمحتوى الأكاديمي
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard
            icon={faCity} label="المدارس المسجلة"
            value={loading ? '…' : stats.schools}
            color="#6366F1" bg="rgba(99,102,241,0.12)"
            trend="منظومة متكاملة"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon={faUsers} label="إجمالي الطلاب"
            value={loading ? '…' : stats.students}
            color="#10B981" bg="rgba(16,185,129,0.12)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon={faChalkboardTeacher} label="عدد المعلمين"
            value={loading ? '…' : stats.teachers}
            color="#F59E0B" bg="rgba(245,158,11,0.12)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon={faServer} label="حالة الخادم"
            value="مستقر" color="#06B6D4" bg="rgba(6,182,212,0.12)"
          />
        </div>
      </div>

      <div className="row g-3">
        {/* Recent Schools */}
        <div className="col-lg-8">
          <div className="card" style={{ border: 'none' }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h6 style={{ margin: 0, fontFamily: 'Cairo, sans-serif', fontWeight: 800 }}>المدارس المسجلة</h6>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>آخر المدارس المضافة للنظام</div>
              </div>
              <Link to="/super/schools" className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faPlus} className="me-1" /> إدارة المدارس
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ paddingRight: '1.5rem' }}>المدرسة</th>
                    <th>المدينة</th>
                    <th>الحالة</th>
                    <th>تاريخ الإضافة</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-4">
                      <div className="spinner-primary mx-auto"></div>
                    </td></tr>
                  ) : recentSchools.length === 0 ? (
                    <tr><td colSpan="4">
                      <div className="empty-state">
                        <FontAwesomeIcon icon={faCity} />
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>لا توجد مدارس بعد</div>
                        <div style={{ fontSize: 13 }}>ابدأ بإضافة أول مدرسة في النظام</div>
                      </div>
                    </td></tr>
                  ) : recentSchools.map((school) => (
                    <tr key={school.id}>
                      <td style={{ paddingRight: '1.5rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontFamily: 'Cairo' }}>
                            {school.name?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{school.name}</div>
                            <div className="text-muted" style={{ fontSize: 11 }}>{school.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{school.city || '—'}</td>
                      <td>
                        <span className={`badge ${school.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                          {school.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {school.created_at ? new Date(school.created_at).toLocaleDateString('ar') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card" style={{ border: 'none' }}>
            <div className="card-header">
              <h6 style={{ margin: 0, fontFamily: 'Cairo, sans-serif', fontWeight: 800 }}>إجراءات سريعة</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <QuickAction to="/super/schools" icon={faCity} label="إضافة مدرسة" color="#6366F1" bg="rgba(99,102,241,0.12)" />
                </div>
                <div className="col-6">
                  <QuickAction to="/super/users" icon={faUsers} label="إدارة المستخدمين" color="#10B981" bg="rgba(16,185,129,0.12)" />
                </div>
                <div className="col-6">
                  <QuickAction to="/super/academic" icon={faGraduationCap} label="الهيكل الأكاديمي" color="#F59E0B" bg="rgba(245,158,11,0.12)" />
                </div>
                <div className="col-6">
                  <QuickAction to="/super/settings" icon={faServer} label="إعدادات النظام" color="#06B6D4" bg="rgba(6,182,212,0.12)" />
                </div>
              </div>

              {/* System Status */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, fontFamily: 'Cairo' }}>حالة النظام</div>
                {[
                  { label: 'قاعدة البيانات', status: true },
                  { label: 'الخادم الرئيسي', status: true },
                  { label: 'نظام المصادقة', status: true },
                  { label: 'الذكاء الاصطناعي', status: false },
                ].map(item => (
                  <div key={item.label} className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: 13 }}>{item.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 6,
                      background: item.status ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: item.status ? '#059669' : '#DC2626'
                    }}>
                      <FontAwesomeIcon icon={faCircleCheck} className="me-1" />
                      {item.status ? 'يعمل' : 'متوقف'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
