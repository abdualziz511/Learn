import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
   faTasks, faCheckCircle, faPrint, faBookOpen, faSave, faTimesCircle, faSignature
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const StudentAssignments = () => {
   const [subjects, setSubjects] = useState([]);
   const [selectedSubject, setSelectedSubject] = useState(null);
   const [assignments, setAssignments] = useState([]);
   const [attendanceRecords, setAttendanceRecords] = useState([]);
   const [stats, setStats] = useState({ total_expected: 0, submitted_count: 0, missed_count: 0, monthly_grade: '---' });
   const [loading, setLoading] = useState(true);
   const [loadingAssignments, setLoadingAssignments] = useState(false);
   const [teacherNote, setTeacherNote] = useState('');
   const [parentNote, setParentNote] = useState('');

   useEffect(() => {
      fetchData();
   }, []);

   useEffect(() => {
      if (selectedSubject) {
         fetchAssignments(selectedSubject.id);
         fetchNotes(selectedSubject.id);
      }
   }, [selectedSubject]);

   const fetchNotes = async (subId) => {
      try {
         const month = new Date().getMonth() + 1;
         const year = new Date().getFullYear();
         
         const tRes = await axiosInstance.get('/student/notes', {
            params: { subject_id: subId, month, year, type: 'teacher' }
         });
         setTeacherNote(tRes.data?.data?.note || '');

         const pRes = await axiosInstance.get('/student/notes', {
            params: { subject_id: subId, month, year, type: 'parent' }
         });
         setParentNote(pRes.data?.data?.note || '');
      } catch (e) {
         console.error("Error fetching notes:", e);
      }
   };

   const fetchData = async () => {
      setLoading(true);
      try {
         const res = await axiosInstance.get('/student/subjects');
         const subjectsData = res.data?.data || [];
         setSubjects(subjectsData);
         if (subjectsData.length > 0) {
            setSelectedSubject(subjectsData[0]);
         }
      } catch (e) { 
         console.error(e); 
      } finally { 
         setLoading(false); 
      }
   };

   const fetchAssignments = async (subjectId) => {
      setLoadingAssignments(true);
      try {
         const res = await axiosInstance.get(`/student/subjects/${subjectId}/assignments`);
         const data = res.data?.data || {};
         setAssignments(data.assignments || []);
         setAttendanceRecords(data.attendance_records || []);
         setStats(data.stats || { total_expected: 0, submitted_count: 0, missed_count: 0, monthly_grade: '---' });
      } catch (e) {
         console.error("Error fetching assignments:", e);
      } finally {
         setLoadingAssignments(false);
      }
   };

   const AssignmentSheet = ({ subject }) => {
      const weeksArr = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'];
      const daysArr = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'];

      const currentMonthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(new Date());
      const teacherName = subject?.teacher_name || '---';

      const rows = weeksArr.flatMap((week, wIdx) =>
         daysArr.map((day, dIdx) => {
            const task = assignments.find(a => 
               (parseInt(a.week_number) === (wIdx + 1)) && 
               (a.day_name === day)
            );
            const attendance = attendanceRecords.find(r => r.date === task?.date);
            return { week, wIdx, day, dIdx, task, attendance };
         })
      );

      if (loadingAssignments) {
         return (
            <div className="text-center py-5">
               <div className="spinner-grow text-success" role="status"></div>
               <p className="mt-3 text-muted font-cairo">جاري سحب التكاليف والبيانات الرقمية...</p>
            </div>
         );
      }

      return (
         <div className="card shadow-lg p-0 overflow-hidden mb-5 animate-in" style={{ borderRadius: '25px', border: '1px solid #dee2e6' }}>
            <div className="bg-white p-4 p-md-5" id="printable-sheet">
               {/* Header Section */}
               <div className="d-flex justify-content-center mb-5">
                  <div className="homework-header-box d-flex align-items-center border border-2 border-dark rounded-3 px-3 py-1" style={{ width: 'fit-content' }}>
                     <div className="px-3 border-start border-2 border-dark font-cairo fw-bold text-nowrap">المادة</div>
                     <div className="px-4 text-primary fw-bold font-cairo border-start border-2 border-dark" style={{ minWidth: '150px' }}>{subject?.name || '---'}</div>
                     <div className="px-4 fw-900 fs-4 text-nowrap font-cairo" style={{ backgroundColor: '#1e3a8a', color: 'white', clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0% 50%)', margin: '0 15px' }}>كشف متابعة الواجبات</div>
                     <div className="px-3 border-start border-2 border-dark font-cairo fw-bold text-nowrap">الشهر</div>
                     <div className="px-4 text-primary fw-bold font-cairo" style={{ minWidth: '120px' }}>{currentMonthName}</div>
                  </div>
               </div>

               {/* Table Section */}
               <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center mb-0 homework-print-table" style={{ borderColor: '#334155', minWidth: '800px', direction: 'rtl' }}>
                     <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                           <th style={{ width: '70px', border: '2px solid #334155' }}>الأسبوع</th>
                           <th style={{ width: '80px', border: '2px solid #334155' }}>اليوم</th>
                           <th style={{ width: '110px', border: '2px solid #334155' }}>التاريخ</th>
                           <th style={{ border: '2px solid #334155' }}>الواجب المطلوب</th>
                           <th style={{ width: '130px', border: '2px solid #334155' }}>توقيع ولي الأمر</th>
                           <th style={{ width: '130px', border: '2px solid #334155' }}>توقيع الأستاذ/ة</th>
                        </tr>
                     </thead>
                     <tbody>
                        {rows.map(({ week, wIdx, day, dIdx, task, attendance }, index) => (
                           <tr key={index} style={{ height: '42px' }}>
                              {dIdx === 0 && (
                                 <td
                                    rowSpan={daysArr.length}
                                    className="fw-bold vertical-text-sheet"
                                    style={{
                                       backgroundColor: '#f1f5f9',
                                       border: '2px solid #334155'
                                    }}
                                 >
                                    {week}
                                 </td>
                              )}
                              <td className="small fw-bold" style={{ border: '2px solid #334155' }}>{day}</td>
                              <td style={{ border: '2px solid #334155' }}>{task?.date || ''}</td>
                              <td className="text-start px-3 fw-bold text-primary" style={{ border: '2px solid #334155', backgroundColor: task ? '#fefce8' : 'transparent' }}>
                                 {task?.description || ''}
                              </td>
                              <td style={{ border: '2px solid #334155' }}>
                                 {task && (
                                    attendance && Boolean(attendance.parent_signed) ? (
                                       <FontAwesomeIcon icon={faSignature} className="text-success" />
                                    ) : (
                                       <FontAwesomeIcon icon={faTimesCircle} className="text-danger opacity-25" />
                                    )
                                 )}
                              </td>
                              <td style={{ border: '2px solid #334155' }}>
                                 {task && (
                                    attendance && Boolean(attendance.teacher_signed) ? (
                                       <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />
                                    ) : (
                                       <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
                                    )
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Footer Section (Updated with 4 Fields) */}
               <div className="mt-4 row g-0 align-items-center" style={{ direction: 'rtl' }}>
                  <div className="col-6">
                     <div className="mb-3 d-flex align-items-center gap-2">
                        <span className="font-cairo fw-bold">مدرس المادة /</span>
                        <div className="flex-grow-1 border-bottom border-dotted py-1 px-3 fw-bold text-primary" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{teacherName}</div>
                     </div>
                     <div className="d-flex align-items-center gap-3">
                        <span className="font-cairo fw-bold">ت /</span>
                        <div className="w-25 border-bottom border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getDate()}</div>
                        <span>/</span>
                        <div className="w-25 border-bottom border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getMonth() + 1}</div>
                        <span>/</span>
                        <div className="w-25 border-bottom border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getFullYear()}</div>
                     </div>
                  </div>
                  <div className="col-6 ps-2">
                     <table className="table table-bordered text-center align-middle small mb-0" style={{ border: '2px solid #334155' }}>
                        <tbody>
                           <tr style={{ backgroundColor: '#f1f5f9' }}>
                              <td colSpan="4" className="fw-bold py-1" style={{ border: '2px solid #334155' }}>إحصائيات إنجاز التكاليف والدرجة المستحقة</td>
                           </tr>
                           <tr className="bg-light">
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 small">إجمالي تكاليف الشهر</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 small">منفذ</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 small">غير منفذ</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 small">الدرجة المستحقة</td>
                           </tr>
                           <tr style={{ height: '40px' }}>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6">{stats.total_expected}</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6 text-success">{stats.submitted_count}</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6 text-danger">{stats.missed_count}</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold fs-5 text-primary">{stats.monthly_grade}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Notes Section */}
               <div className="mt-4 pt-3" style={{ direction: 'rtl' }}>
                  <div className="d-flex align-items-center mb-3">
                     <span className="fw-bold text-nowrap me-2 font-cairo small">ملاحظات المربية :</span>
                     <div className="flex-grow-1 border-bottom border-dotted py-1 px-3 text-primary fw-bold font-cairo small" style={{ borderBottomStyle: 'dotted', minHeight: '30px' }}>
                        {teacherNote}
                     </div>
                  </div>
                  <div className="d-flex align-items-center">
                     <span className="fw-bold text-nowrap me-2 font-cairo small">ملاحظات ولي الأمر :</span>
                     <div className="flex-grow-1 border-bottom border-dotted py-1 px-3 text-dark fw-bold font-cairo small" style={{ borderBottomStyle: 'dotted', minHeight: '30px' }}>
                        {parentNote}
                     </div>
                  </div>
               </div>

               <div className="d-print-none d-flex justify-content-end mt-4">
                  <button className="btn btn-primary rounded-pill px-5 shadow fw-bold" onClick={() => window.print()}>
                     <FontAwesomeIcon icon={faPrint} className="me-2" /> طباعة كشف المتابعة
                  </button>
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="animate-in container-fluid py-4">
         <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-success text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
            <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
               <div>
                  <h2 className="fw-900 mb-1 font-cairo">مستكشف الواجبات</h2>
                  <p className="mb-0 opacity-80 small font-cairo">متابعة دقيقة للمهام الدراسية والدرجات الشهرية</p>
               </div>
               <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
                  <FontAwesomeIcon icon={faTasks} size="xl" />
               </div>
            </div>
         </div>

         <div className="subjects-nav mb-4 pb-2 text-end" style={{ direction: 'rtl' }}>
            <h6 className="fw-bold mb-3 text-muted px-2 font-cairo small">اختر المادة لعرض كشف المتابعة:</h6>
            <div className="d-flex flex-wrap gap-2">
               {subjects.map(s => (
                  <button
                     key={s.id}
                     className={`btn rounded-pill px-4 py-2 fw-bold transition-all d-flex align-items-center gap-2 ${selectedSubject?.id === s.id ? 'btn-success shadow-sm' : 'btn-white border text-muted shadow-none'}`}
                     onClick={() => setSelectedSubject(s)}
                  >
                     <div className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: selectedSubject?.id === s.id ? '#fff' : (s.color || '#10b981') }}></div>
                     <span className="font-cairo small">{s.name}</span>
                  </button>
               ))}
            </div>
         </div>

         {loading ? (
            <div className="text-center py-5">
               <div className="spinner-border text-success" />
            </div>
         ) : selectedSubject ? (
            <AssignmentSheet subject={selectedSubject} />
         ) : (
            <div className="text-center py-5 bg-light rounded-4 border-dashed mx-2">
               <FontAwesomeIcon icon={faBookOpen} size="3x" className="mb-3 opacity-20 text-success" />
               <p className="text-muted font-cairo">يرجى اختيار مادة لعرض كشف المتابعة الخاص بها</p>
            </div>
         )}

         <style>{`
            .font-cairo { font-family: 'Cairo', sans-serif !important; }
            .fw-900 { font-weight: 900; }
            .vertical-text-sheet { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 1rem; }
            .homework-print-table td, .homework-print-table th { border: 2px solid #334155 !important; }
            @media print {
               body * { visibility: hidden; }
               #printable-sheet, #printable-sheet * { visibility: visible; }
               #printable-sheet { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
            }
         `}</style>
      </div>
   );
};

export default StudentAssignments;
