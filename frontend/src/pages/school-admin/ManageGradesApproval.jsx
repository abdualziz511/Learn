import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faTimesCircle, faFileAlt, faUserGraduate, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageGradesApproval = () => {
  const [pendingGrades, setPendingGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    try {
      const res = await axiosInstance.get('/school-admin/grades?status=pending');
      setPendingGrades(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleApproveAll = async () => {
    const result = await Swal.fire({
      title: 'اتمام عملية الاعتماد؟',
      text: "سيتم اعتماد كافة الدرجات وإرسال النتائج للطلاب وأولياء الأمور فوراً عبر الإشعارات",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، اعتمد الجميع',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#6366F1'
    });
// ... rest of code

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch('/school-admin/grades/approve-all');
        fetchPendingGrades();
        Swal.fire('تم الاعتماد', 'تم إرسال النتائج بنجاح', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل في اعتماد الدرجات', 'error'); }
    }
  };

  return (
    <div className="animate-in">
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>إعتماد النتائج الشهرية</h2>
            <p className="mb-0 opacity-80 small">مراجعة الدرجات المدخلة من قبل المعلمين قبل نشرها للطلاب</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {pendingGrades.length > 0 && (
              <button className="btn btn-white btn-sm rounded-pill px-4 shadow-sm fw-bold text-primary" onClick={handleApproveAll}>
                <FontAwesomeIcon icon={faCheckDouble} className="me-2" /> اعتماد كافة النتائج
              </button>
            )}
            <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
              <FontAwesomeIcon icon={faCheckCircle} size="xl" />
            </div>
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small">
              <tr>
                <th className="ps-4">الطالب</th>
                <th>المادة/المعلم</th>
                <th>نوع التقييم</th>
                <th>الدرجة</th>
                <th className="text-center pe-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-5"><div className="spinner-primary"></div></td></tr>
              ) : pendingGrades.length > 0 ? (
                pendingGrades.map(g => (
                  <tr key={g.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUserGraduate} className="text-muted" />
                        <div className="fw-bold small">{g.student_name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-bold text-primary">{g.subject_name}</div>
                      <div className="text-muted" style={{ fontSize: 10 }}>المعلم: {g.teacher_name}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{g.grade_type}</span></td>
                    <td>
                       <div className="fw-bold text-success">{g.score} <span className="text-muted small">/ {g.max_score}</span></div>
                    </td>
                    <td className="text-center pe-4">
                       <div className="d-flex justify-content-center gap-1">
                          <button className="btn btn-sm btn-outline-success"><FontAwesomeIcon icon={faCheckCircle} /></button>
                          <button className="btn btn-sm btn-outline-danger"><FontAwesomeIcon icon={faTimesCircle} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">لا توجد درجات معلقة للاعتماد حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageGradesApproval;
