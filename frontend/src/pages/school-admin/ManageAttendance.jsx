import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faFilter, faSearch, faCheckCircle,
  faTimesCircle, faClock, faUserGraduate, faBell, faHistory
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ present: 0, absent: 0, percentage: '0%' });

  useEffect(() => {
    fetchAttendance();
  }, [filterDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/school-admin/attendance?date=${filterDate}`);
      const data = res.data?.data || [];
      setAttendance(data);
      
      // Calculate Stats
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const total = data.length;
      setStats({
        present, absent,
        percentage: total > 0 ? Math.round((present / total) * 100) + '%' : '0%'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/school-admin/attendance/${id}/approve`);
      fetchAttendance();
      Swal.fire({
         title: 'تم الاعتماد',
         text: 'سيتم إرسال إشعار فوري لولي الأمر',
         icon: 'success',
         timer: 1500,
         showConfirmButton: false
      });
    } catch (err) { Swal.fire('خطأ', 'فشل الاعتماد', 'error'); }
  };

  return (
    <div className="animate-in">
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>كشوفات التحضير اليومية</h2>
            <p className="mb-0 opacity-80 small">مراجعة غياب وحضور الطلاب واعتماده لإرسال تنبيهات الأهل</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-3">
               <input 
                 type="date" 
                 className="form-control form-control-sm border-0 shadow-none bg-transparent text-white fw-bold" 
                 value={filterDate} 
                 onChange={(e) => setFilterDate(e.target.value)}
                 style={{ colorScheme: 'dark' }}
               />
            </div>
            <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
              <FontAwesomeIcon icon={faCalendarCheck} size="xl" />
            </div>
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <div className="row g-3 mb-4">
         <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 text-center">
               <div className="text-muted small mb-1">نسبة الحضور</div>
               <div className="h3 fw-bold text-primary">{stats.percentage}</div>
            </div>
         </div>
         <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 text-center">
               <div className="text-muted small mb-1">إجمالي الحاضرين</div>
               <div className="h3 fw-bold text-success">{stats.present}</div>
            </div>
         </div>
         <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 text-center text-danger">
               <div className="text-muted small mb-1">إجمالي الغائبين</div>
               <div className="h3 fw-bold">{stats.absent}</div>
            </div>
         </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
         <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
            <h6 className="mb-0 fw-bold">طلبات التحضير المعلقة</h6>
            <span className="badge bg-warning text-dark">{attendance.filter(a => a.approval_status === 'pending').length} انتظار</span>
         </div>
         <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
               <thead className="bg-light small">
                  <tr>
                     <th className="ps-4">الطالب</th>
                     <th>الصف / الفصل</th>
                     <th>المادة / المعلم</th>
                     <th>الحالة</th>
                     <th>التفاصيل</th>
                     <th className="text-center pe-4">الاعتماد</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                     <tr><td colSpan="6" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
                  ) : attendance.length > 0 ? (
                     attendance.map(a => (
                        <tr key={a.id}>
                           <td className="ps-4">
                              <div className="d-flex align-items-center">
                                 <div className="avatar bg-light text-muted me-2" style={{ width: 32, height: 32, fontSize: 10 }}>
                                    <FontAwesomeIcon icon={faUserGraduate} />
                                 </div>
                                 <div className="fw-bold small">{a.student_name}</div>
                              </div>
                           </td>
                           <td>
                              <div className="small font-bold">{a.grade_name}</div>
                              <div className="text-muted" style={{ fontSize: 10 }}>فصل: {a.class_name}</div>
                           </td>
                           <td>
                              <div className="small text-primary fw-bold">{a.subject_name || 'عام'}</div>
                              <div className="text-muted" style={{ fontSize: 10 }}>المعلم: {a.teacher_name}</div>
                           </td>
                           <td>
                              {a.status === 'present' ? (
                                 <span className="badge bg-success bg-opacity-10 text-success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> حاضر</span>
                              ) : (
                                 <span className="badge bg-danger bg-opacity-10 text-danger"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> غائب</span>
                              )}
                           </td>
                           <td className="small text-muted">{a.note || '---'}</td>
                           <td className="text-center pe-4">
                              {a.approval_status === 'pending' ? (
                                 <div className="d-flex justify-content-center gap-1">
                                    <button className="btn btn-sm btn-success px-3" onClick={() => handleApprove(a.id)}>اعتمـاد</button>
                                    <button className="btn btn-sm btn-outline-danger">رفض</button>
                                 </div>
                              ) : (
                                 <span className="text-success small fw-bold">
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> تم الاعتماد
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr><td colSpan="6" className="text-center py-5 text-muted">لا يوجد كشوفات مسجلة لهذا التاريخ</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ManageAttendance;
