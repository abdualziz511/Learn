import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf, faDownload, faCalendarAlt, faChartBar, 
  faArrowRight, faPrint, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';

const ParentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
       try {
          const res = await axiosInstance.get('/parent/reports');
          setReports(res.data?.data || [
             { id: 1, title: 'نتيجة اختبار شهر أكتوبر', child: 'أحمد محمد', date: '2026-11-05', status: 'approved', gpa: '92%' },
             { id: 2, title: 'كشف المتابعة الشهري - نوفمبر', child: 'خالد محمد', date: '2026-12-01', status: 'approved', gpa: '84%' },
          ]);
       } catch (e) { console.error(e); }
       setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
        <div>
          <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>التقارير والشهادات</h2>
          <p className="mb-0 opacity-80 small">عرض الشهادات الشهرية والنهائية المعتمدة من إدارة المدرسة</p>
        </div>
      </div>

      <div className="row g-4">
         {loading ? (
            <div className="text-center py-5 col-12"><div className="spinner-primary"></div></div>
         ) : (
            reports.map(r => (
               <div className="col-md-6" key={r.id}>
                  <div className="card shadow-sm border-0 transition-hover">
                     <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                           <div className="d-flex align-items-center gap-3">
                              <div className="avatar bg-info bg-opacity-10 text-info">
                                 <FontAwesomeIcon icon={faFilePdf} />
                              </div>
                              <div>
                                 <h6 className="fw-bold mb-1">{r.title}</h6>
                                 <div className="text-muted x-small d-flex gap-2">
                                    <FontAwesomeIcon icon={faUserGraduate} className="text-muted" size="xs" />
                                    <span>للطالب: <span className="fw-bold">{r.child}</span></span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-end">
                              <div className="badge bg-success bg-opacity-10 text-success mb-1">معتمد من الإدارة</div>
                              <div className="x-small text-muted">{r.date}</div>
                           </div>
                        </div>
                        
                        <div className="row g-2 mb-4">
                           <div className="col-12">
                              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                                 <div className="small fw-bold">النسبة المئوية الإجمالية</div>
                                 <div className="h4 fw-900 mb-0 text-primary">{r.gpa}</div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                           <button className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                              <FontAwesomeIcon icon={faDownload} />
                              <span>تحميل التقرير</span>
                           </button>
                           <button className="btn btn-light btn-icon shadow-sm">
                              <FontAwesomeIcon icon={faPrint} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            ))
         )}

         <div className="col-12 mt-5">
            <div className="card border-0 shadow-sm bg-info bg-opacity-5">
               <div className="card-body p-5 text-center">
                   <FontAwesomeIcon icon={faChartBar} size="3x" className="text-info mb-3 opacity-20" />
                   <h5 className="fw-bold">قريباً: تقارير الأداء الفصلي</h5>
                   <p className="text-muted small mx-auto" style={{ maxWidth: 400 }}>
                      سيتم إصدار الشهادات النهائية للفصل الدراسي الأول بعد انتهاء فترة الاختبارات واعتمادها من المدرسة.
                   </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ParentReports;
