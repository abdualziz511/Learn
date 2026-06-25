import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
   faClipboardList, faUsers, faCheckCircle, faTimesCircle,
   faStar, faUserEdit, faSave, faArrowRight, faFilter,
   faCalendarDay, faCalendarAlt, faEye, faPrint, faFileInvoice,
   faChevronLeft, faSignature, faTasks
} from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

// --- Sub-Component: Student Monthly Sheet ---
const StudentMonthlySheet = ({ student, subjectName, teacherName, onClose }) => {
   const weeks = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'];
   const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'];
   const currentMonthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(new Date());

   const rows = weeks.flatMap((week, wIdx) =>
      days.map((day, dIdx) => {
         const task = (student.assignments || []).find(a =>
            (parseInt(a.week_number) === (wIdx + 1)) &&
            (a.day_name === day)
         );
         const attendance = (student.attendance_records || []).find(r => r.date === task?.date);
         return { week, wIdx, day, dIdx, task, attendance };
      })
   );

   // Strict Stats calculation based ONLY on the current sheet rows
   const executedCount = rows.filter(r => r.task && r.attendance?.teacher_signed).length;
   const missedCount = rows.filter(r => r.task && (!r.attendance || !r.attendance.teacher_signed)).length;

   const [totalExpected, setTotalExpected] = useState(student.assignments?.length || 0);
   const [submitted, setSubmitted] = useState(executedCount);
   const [missed, setMissed] = useState(missedCount);
   const [monthlyGrade, setMonthlyGrade] = useState(student.monthly_score || '');
   const [teacherNote, setTeacherNote] = useState('');
   const [parentNote, setParentNote] = useState('');
   const [saving, setSaving] = useState(false);
   const [savingNote, setSavingNote] = useState(false);

   const subjectId = student.subject_id || student.id_subject;

   useEffect(() => {
      // Trust the local calculation over any global data
      setSubmitted(executedCount);
      setMissed(missedCount);
      setTotalExpected(student.assignments?.length || 0);
   }, [student.attendance_records, student.assignments, executedCount, missedCount]);

   // Fetch Notes
   useEffect(() => {
      const fetchNotes = async () => {
         const month = new Date().getMonth() + 1;
         const year = new Date().getFullYear();
         const sid = subjectId;
         if (!sid || !student.id) return;

         try {
            const tRes = await axiosInstance.get('/teacher/notes', {
               params: { student_id: student.id, subject_id: sid, month, year, type: 'teacher' }
            });
            setTeacherNote(tRes.data?.data?.note || '');

            const pRes = await axiosInstance.get('/teacher/notes', {
               params: { student_id: student.id, subject_id: sid, month, year, type: 'parent' }
            });
            setParentNote(pRes.data?.data?.note || '');
         } catch (e) {
            console.error("Error fetching notes:", e);
         }
      };
      fetchNotes();
   }, [student.id, subjectId]);

   const handleSave = async () => {
      setSaving(true);
      try {
         await axiosInstance.post('/attendance', {
            action: 'save_monthly_grade',
            student_id: student.id,
            class_id: student.class_id,
            subject_id: student.subject_id,
            score: monthlyGrade,
            note: teacherNote,
            stats: { totalExpected, submitted: executedCount, missed: missedCount }
         });

         // Also save/update the teacher note in sheet_notes table via the shared API
         await axiosInstance.post('/teacher/notes', {
            student_id: student.id,
            subject_id: student.subject_id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            note: teacherNote
         });

         Swal.fire('تم الحفظ', 'تم رصد الدرجة وكافة البيانات بنجاح', 'success');
      } catch (e) {
         Swal.fire('خطأ', 'فشل في عملية الحفظ', 'error');
      }
      setSaving(false);
   };

   const saveTeacherNoteOnly = async () => {
      if (!teacherNote) return Swal.fire('تنبيه', 'يرجى كتابة الملاحظة أولاً', 'info');
      setSavingNote(true);
      try {
         await axiosInstance.post('/teacher/notes', {
            student_id: student.id,
            subject_id: student.subject_id || student.id_subject,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            note: teacherNote
         });
         Swal.fire({
            title: 'تم الحفظ',
            text: 'تم حفظ ملاحظة المعلم بنجاح وهي تظهر الآن للجميع',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
         });
      } catch (e) {
         Swal.fire('خطأ', 'فشل في حفظ الملاحظة', 'error');
      }
      setSavingNote(false);
   };

   return (
      <div className="animate-in pb-5" style={{ direction: 'rtl' }}>
         <div className="d-flex justify-content-between align-items-center mb-4 no-print">
            <button className="btn btn-outline-secondary rounded-pill px-4 shadow-sm fw-bold" onClick={onClose}>
               <FontAwesomeIcon icon={faArrowRight} className="ms-2" /> العودة للقائمة
            </button>
            <div>
               <span className="me-3 badge bg-light text-dark p-2 border">معاينة الطالب: {student.name}</span>
               <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onClick={() => window.print()}>
                  <FontAwesomeIcon icon={faPrint} className="ms-2" /> طباعة الكشف
               </button>
            </div>
         </div>

         <div className="card shadow-lg border-0 rounded-0 bg-white mx-auto printable-area" style={{ maxWidth: '950px', border: '1px solid #dee2e6' }}>
            <div className="card-body p-4 p-md-5">
               <div className="d-flex justify-content-center mb-4">
                  <div className="homework-sheet-header d-flex align-items-center">
                     <div className="side-label">المادة</div>
                     <div className="dotted-line flex-grow-1 mx-2" style={{ minWidth: '150px' }}>{subjectName || '..........'}</div>
                     <div className="main-title">كشف متابعة الواجبات</div>
                     <div className="side-label ms-2">شهر</div>
                     <div className="dotted-line flex-grow-1 mx-2" style={{ minWidth: '100px' }}>{currentMonthName}</div>
                  </div>
               </div>

               <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center mb-0 homework-table">
                     <thead>
                        <tr>
                           <th style={{ width: '80px' }}>الأسبوع</th>
                           <th style={{ width: '80px' }}>اليوم</th>
                           <th style={{ width: '100px' }}>التاريخ</th>
                           <th>الواجب المطلوب</th>
                           <th style={{ width: '130px' }}>توقيع ولي الأمر</th>
                           <th style={{ width: '130px' }}>توقيع الأستاذ/ة</th>
                        </tr>
                     </thead>
                     <tbody>
                        {rows.map(({ week, dIdx, task, attendance }, index) => (
                           <tr key={index} style={{ height: '38px' }}>
                              {dIdx === 0 && (
                                 <td rowSpan={5} className="fw-bold vertical-text bg-light-blue">{week}</td>
                              )}
                              <td className="small fw-bold">{days[dIdx]}</td>
                              <td className="small">{task?.date || ''}</td>
                              <td className="text-start px-2 small fw-bold text-primary">{task?.description || ''}</td>
                              <td className="text-center">
                                 {task && (
                                    attendance && Boolean(attendance.parent_signed) ? (
                                       <FontAwesomeIcon icon={faSignature} className="text-success" />
                                    ) : (
                                       <FontAwesomeIcon icon={faTimesCircle} className="text-danger opacity-25" />
                                    )
                                 )}
                              </td>
                              <td className="text-center">
                                 {task && (
                                    attendance && Boolean(attendance.teacher_signed) ? (
                                       <FontAwesomeIcon icon={faSignature} className="text-primary" />
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

               <div className="row mt-3 g-0 align-items-center" style={{ direction: 'rtl' }}>
                  <div className="col-6">
                     <div className="mb-3 d-flex align-items-center gap-2">
                        <span className="font-cairo fw-bold">مدرس المادة /</span>
                        <div className="flex-grow-1 border-bottom border-secondary border-dotted py-1 px-3 fw-bold text-primary" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{teacherName}</div>
                     </div>
                     <div className="d-flex align-items-center gap-3">
                        <span className="font-cairo fw-bold">ت /</span>
                        <div className="w-25 border-bottom border-secondary border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getDate()}</div>
                        <span>/</span>
                        <div className="w-25 border-bottom border-secondary border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getMonth() + 1}</div>
                        <span>/</span>
                        <div className="w-25 border-bottom border-secondary border-dotted text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getFullYear()}</div>
                     </div>
                  </div>
                  <div className="col-6 ps-2">
                     <table className="table table-bordered text-center align-middle small mb-0" style={{ border: '2px solid #334155' }}>
                        <tbody>
                           <tr style={{ backgroundColor: '#f1f5f9' }}>
                              <td colSpan={4} className="fw-bold py-1" style={{ border: '2px solid #334155' }}>الواجبات المقررة خلال الشهر</td>
                           </tr>
                           <tr className="bg-light">
                              <td style={{ border: '2px solid #334155', width: '25%' }} className="fw-bold py-1 x-small">الواجبات المقررة</td>
                              <td style={{ border: '2px solid #334155', width: '30%' }} className="fw-bold py-1 x-small">الدرجة الشهرية</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 x-small">منفذ</td>
                              <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 x-small">غير منفذ</td>
                           </tr>
                           <tr style={{ height: '40px' }}>
                              <td className="p-0">
                                 <div className="d-flex align-items-center justify-content-center h-100 fw-bold fs-5 text-dark" style={{ minHeight: '40px' }}>
                                    {totalExpected || 0}
                                 </div>
                              </td>
                              <td className="p-0 bg-white">
                                 <div className="p-1 h-100 d-flex align-items-center justify-content-center">
                                    <input
                                       type="text"
                                       className="form-control form-control-sm border-0 text-center fw-bold fs-5 text-danger px-1"
                                       placeholder=".../10"
                                       style={{ backgroundColor: '#fdf2f2', borderRadius: '8px', maxWidth: '80px' }}
                                       value={monthlyGrade}
                                       onChange={(e) => setMonthlyGrade(e.target.value)}
                                    />
                                 </div>
                              </td>
                              <td className="p-0">
                                 <div className="d-flex align-items-center justify-content-center h-100 fw-bold fs-5 text-success"
                                    style={{ backgroundColor: '#f0fdf4', minHeight: '40px' }}>
                                    {submitted || (student.executed_count ?? 0)}
                                 </div>
                              </td>
                              <td className="p-0">
                                 <div className="d-flex align-items-center justify-content-center h-100 fw-bold fs-5 text-warning"
                                    style={{ backgroundColor: '#fffbeb', minHeight: '40px' }}>
                                    {missed || (student.missed_count ?? 0)}
                                 </div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="mt-4 border-top pt-3">
                  <div className="d-flex align-items-center mb-3 gap-2">
                     <span className="fw-bold text-nowrap me-2">ملاحظات المربية :</span>
                     <input type="text" className="note-input border-0 flex-grow-1" placeholder=".................................................................." value={teacherNote} onChange={(e) => setTeacherNote(e.target.value)} />
                     <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-print-none no-print"
                        onClick={saveTeacherNoteOnly}
                        disabled={savingNote}
                        style={{ fontSize: '0.8rem' }}
                     >
                        {savingNote ? <span className="spinner-border spinner-border-sm ms-1"></span> : <FontAwesomeIcon icon={faSave} className="ms-1" />}
                        حفظ الملاحظة
                     </button>
                  </div>
                  <div className="d-flex align-items-center">
                     <span className="fw-bold text-nowrap me-2">ملاحظات ولي الأمر :</span>
                     <input type="text" className="note-input border-0 flex-grow-1" placeholder=".................................................................." value={parentNote} readOnly />
                  </div>
               </div>

               <div className="mt-5 text-center no-print">
                  <button className="btn btn-success btn-lg rounded-pill px-5 shadow fw-bold" onClick={handleSave} disabled={saving}>
                     {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                     اعتماد ورصد بيانات الشهر للطالب {student.name}
                  </button>
               </div>
            </div>
         </div>

         <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          body { background: white !important; }
        }
        .bg-light-blue { background-color: #f1f5f9; }
        .homework-sheet-header { width: 100%; max-width: 800px; border: 2px solid #334155; padding: 4px; border-radius: 8px; }
        .homework-sheet-header .main-title { background-color: #1e3a8a; color: white; padding: 8px 30px; font-weight: 900; font-size: 1.4rem; border-radius: 4px; clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0% 50%); }
        .homework-sheet-header .side-label { background-color: #1e3a8a; color: white; padding: 10px 15px; font-weight: bold; border-radius: 4px; }
        .homework-sheet-header .dotted-line { border-bottom: 2px dotted #334155; height: 30px; line-height: 40px; text-align: center; font-weight: bold; }
        .homework-table th { background-color: #f1f5f9; color: #1e3a8a; padding: 8px; font-size: 0.9rem; border: 2px solid #334155 !important; }
        .homework-table td { border: 1.5px solid #334155 !important; }
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 1.1rem; }
        .table-footer td { border: 2px solid #334155 !important; padding: 5px; }
        .note-input { border-bottom: 1.5px dotted #334155 !important; font-family: 'Cairo', sans-serif; font-weight: 500; font-size: 1rem; color: #1e3a8a; flex-grow: 1; }
        .note-input:focus { outline: none; border-bottom-color: #1e3a8a !important; }
      `}</style>
      </div>
   );
};

const TeacherAttendance = () => {
   const [searchParams] = useSearchParams();
   const schoolId = searchParams.get('school');
   const classParam = searchParams.get('class');
   const subjectParam = searchParams.get('subject');

   const [teacherSchools, setTeacherSchools] = useState([]);
   const [gradeLevels, setGradeLevels] = useState([]);
   const [sections, setSections] = useState([]);
   const [subjects, setSubjects] = useState([]);

   const [selectedSchool, setSelectedSchool] = useState(schoolId || '');
   const [selectedGrade, setSelectedGrade] = useState('');
   const [selectedSection, setSelectedSection] = useState(classParam || '');
   const [selectedSubject, setSelectedSubject] = useState(subjectParam || '');

   const [activeTab, setActiveTab] = useState('daily');
   const [students, setStudents] = useState([]);
   const [monthlyStats, setMonthlyStats] = useState([]);
   const [monthlyAssignments, setMonthlyAssignments] = useState([]);
   const [todayAssignment, setTodayAssignment] = useState(null);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [selectedForPreview, setSelectedForPreview] = useState(null);

   useEffect(() => {
      fetchSchools();
   }, []);

   useEffect(() => {
      if (selectedSchool) fetchGrades(selectedSchool);
      else setGradeLevels([]);
      setSelectedGrade('');
      setSections([]);
      setSelectedSection('');
      setSubjects([]);
      setSelectedSubject('');
   }, [selectedSchool]);

   useEffect(() => {
      if (selectedSchool && selectedGrade) fetchSections(selectedSchool, selectedGrade);
      else setSections([]);
      setSelectedSection('');
      setSubjects([]);
      setSelectedSubject('');
   }, [selectedGrade]);

   useEffect(() => {
      if (selectedSchool && selectedSection) fetchSubjects(selectedSchool, selectedSection);
      else setSubjects([]);
      setSelectedSubject('');
   }, [selectedSection]);

   const fetchSchools = async () => {
      try {
         const res = await axiosInstance.get('/teacher/attendance/schools');
         if (res.data?.status === 'success') setTeacherSchools(res.data.data || []);
      } catch (e) { console.error(e); }
   };

   const fetchGrades = async (schId) => {
      try {
         const res = await axiosInstance.get(`/teacher/attendance/grades?school_id=${schId}`);
         if (res.data?.status === 'success') setGradeLevels(res.data.data || []);
      } catch (e) { console.error(e); }
   };

   const fetchSections = async (schId, grdId) => {
      try {
         const res = await axiosInstance.get(`/teacher/attendance/classes?school_id=${schId}&grade_id=${grdId}`);
         if (res.data?.status === 'success') setSections(res.data.data || []);
      } catch (e) { console.error(e); }
   };

   const fetchSubjects = async (schId, secId) => {
      try {
         const res = await axiosInstance.get(`/teacher/attendance/subjects?school_id=${schId}&class_id=${secId}`);
         if (res.data?.status === 'success') setSubjects(res.data.data || []);
      } catch (e) { console.error(e); }
   };

   const loadStudents = async (cid = selectedSection, sid = selectedSubject, schId = selectedSchool) => {
      if (!cid || !sid || !schId) {
         Swal.fire('تنبيه', 'يرجى اختيار المدرسة والشعبة والمادة أولاً', 'info');
         return;
      }
      setLoading(true);
      try {
         const res = await axiosInstance.get(`/teacher/students?class_id=${cid}&subject_id=${sid}&school_id=${schId}`);
         const attendRes = await axiosInstance.get(`/teacher/attendance?class_id=${cid}&subject_id=${sid}&date=${new Date().toISOString().split('T')[0]}`);

         const assignRes = await axiosInstance.get(`/teacher/monthly-stats?class_id=${cid}&subject_id=${sid}`);
         let hasTaskToday = false;
         if (assignRes.data?.status === 'success') {
            const today = new Date().toISOString().split('T')[0];
            const found = (assignRes.data.data?.assignments || []).find(a => a.date === today);
            setTodayAssignment(found || null);
            hasTaskToday = !!found;
         }

         if (res.data?.status === 'success') {
            if (!hasTaskToday) {
               setStudents([]);
               return;
            }
            const studentList = res.data.data || [];
            const existingAttendance = attendRes.data?.data || [];

            setStudents(studentList.map(s => {
               const attendance = existingAttendance.find(a => a.student_id === s.id);
               return {
                  ...s,
                  teacher_signed: attendance ? Boolean(attendance.teacher_signed) : false,
                  parent_signed: attendance ? Boolean(attendance.parent_signed) : false,
                  note: attendance ? attendance.note : '',
                  approval_status: attendance ? attendance.approval_status : 'pending',
                  participation: 0,
                  behavior: 0,
                  homework: attendance ? (attendance.teacher_signed ? 5 : 0) : 0
               };
            }));
         }
      } catch (e) {
         console.error(e);
         Swal.fire('خطأ', 'فشل في جلب قائمة الطلاب', 'error');
      } finally {
         setLoading(false);
      }
   };

   const loadMonthlyStats = async (cid = selectedSection, sid = selectedSubject) => {
      if (!cid || !sid) {
         Swal.fire('تنبيه', 'يرجى اختيار الشعبة والمادة أولاً', 'info');
         return;
      }
      setLoading(true);
      try {
         const res = await axiosInstance.get(`/teacher/monthly-stats?class_id=${cid}&subject_id=${sid}`);
         if (res.data?.status === 'success') {
            setMonthlyStats(res.data.data?.students || []);
            setMonthlyAssignments(res.data.data?.assignments || []);
         }
      } catch (e) {
         console.error(e);
         const msg = e.response?.data?.message || 'ليس لديك صلاحية أو فشل الاتصال';
         Swal.fire('خطأ', msg, 'error');
      }
      setLoading(false);
   };

   const handleGradeChange = (id, field, value) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
   };

   const handleSubmitDaily = async () => {
      setSaving(true);
      try {
         await axiosInstance.post('/teacher/daily-followup', {
            class_id: selectedSection,
            subject_id: selectedSubject,
            submit_to_director: true,
            date: new Date().toISOString().split('T')[0],
            students: students.map(s => ({
               student_id: s.id,
               status: 'present',
               homework_score: s.teacher_signed ? 5 : 0,
               teacher_signed: s.teacher_signed,
               note: s.note
            }))
         });
         Swal.fire('تم الحفظ', 'تم رفع كشف المتابعة بنجاح بانتظار اعتماد المدير، تم قفل البيانات', 'success');
         loadStudents(); // Reload to reflect locked state
      } catch (e) {
         Swal.fire('خطأ', 'فشل في حفظ البيانات', 'error');
      } finally {
         setSaving(false);
      }
   };

   const [showAddModal, setShowAddModal] = useState(false);
   const [newAssignment, setNewAssignment] = useState('');

   const handleAddAssignment = async () => {
      if (!newAssignment) return Swal.fire('تنبيه', 'يرجى كتابة وصف التكليف', 'warning');

      const today = new Date();
      const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = dayNames[today.getDay()];
      const weekNum = Math.ceil(today.getDate() / 7);

      setSaving(true);
      try {
         const res = await axiosInstance.post('/teacher/assignments/add', {
            school_id: selectedSchool,
            grade_id: selectedGrade,
            class_id: selectedSection,
            subject_id: selectedSubject,
            task_description: newAssignment,
            date: today.toISOString().split('T')[0],
            day_name: dayName,
            week_number: weekNum
         });
         if (res.data?.status === 'success') {
            Swal.fire('تمت الإضافة', 'تم تسجيل التكليف بنجاح وسيظهر في سجلات الطلاب', 'success');
            setShowAddModal(false);
            setNewAssignment('');
         }
      } catch (e) {
         Swal.fire('خطأ', 'فشل في إضافة التكليف', 'error');
      }
      setSaving(false);
   };

   if (selectedForPreview) {
      const currentTeacher = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherFullName = currentTeacher.name || '';
      const activeSubjectName = subjects.find(s => s.id == selectedSubject)?.name || '';

      return (
         <div className="container py-4">
            <StudentMonthlySheet
               student={{ ...selectedForPreview, assignments: monthlyAssignments, subject_id: selectedSubject }}
               subjectName={activeSubjectName}
               teacherName={teacherFullName}
               onClose={() => setSelectedForPreview(null)}
            />
         </div>
      );
   }

   return (
      <div className="animate-in">
         <div className="page-hero mb-4">
            <div className="row align-items-center">
               <div className="col-md-6">
                  <h2 className="fw-900 mb-0 font-cairo">كشف متابعة التكاليف والمهام</h2>
                  <p className="mb-0 opacity-80 small font-cairo text-secondary">تحكم كامل في الأداء الأكاديمي، التكاليف، والتقييم الشهري</p>
               </div>
               <div className="col-md-12 d-flex flex-wrap justify-content-center gap-2 mt-4">
                  <select className="form-select border-0 shadow-sm rounded-pill px-4" style={{ width: 'auto', minWidth: '160px' }} value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                     <option value="">حدد المدرسة...</option>
                     {teacherSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>

                  <select className="form-select border-0 shadow-sm rounded-pill px-4" style={{ width: 'auto', minWidth: '160px' }} value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} disabled={!selectedSchool}>
                     <option value="">حدد الصف...</option>
                     {gradeLevels.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>

                  <select className="form-select border-0 shadow-sm rounded-pill px-4" style={{ width: 'auto', minWidth: '160px' }} value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedGrade}>
                     <option value="">حدد الشعبة...</option>
                     {sections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <select className="form-select border-0 shadow-sm rounded-pill px-4" style={{ width: 'auto', minWidth: '160px' }} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedSection}>
                     <option value="">حدد المادة...</option>
                     {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>

                  <button className="btn btn-warning rounded-pill px-4 shadow-sm fw-bold text-dark me-2" onClick={() => setShowAddModal(true)} disabled={!selectedSubject}>
                     <FontAwesomeIcon icon={faTasks} className="me-2" /> إضافة تكليف جديد
                  </button>

                  <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => activeTab === 'daily' ? loadStudents() : loadMonthlyStats()} disabled={!selectedSubject}>
                     <FontAwesomeIcon icon={faFilter} className="me-2" /> عرض البيانات
                  </button>
               </div>
            </div>
         </div>

         <div className="card border-0 shadow-sm mb-4 rounded-4 bg-white" style={{ direction: 'rtl' }}>
            <div className="d-flex p-2">
               <button
                  className={`flex-fill btn py-3 fw-bold rounded-4 transition-all ${activeTab === 'daily' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
                  onClick={() => setActiveTab('daily')}
               >
                  <FontAwesomeIcon icon={faCalendarDay} className="ms-2" /> المتابعة اليومية (رصد الحصة)
               </button>
               <button
                  className={`flex-fill btn py-3 fw-bold rounded-4 transition-all ${activeTab === 'monthly' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
                  onClick={() => setActiveTab('monthly')}
               >
                  <FontAwesomeIcon icon={faCalendarAlt} className="ms-2" /> المتابعة الشهرية (إحصائيات وكشوف)
               </button>
            </div>
         </div>

         {loading ? (
            <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
               <div className="spinner-border text-primary"></div>
               <p className="text-muted fw-bold">جاري تحميل البيانات...</p>
            </div>
         ) : activeTab === 'daily' ? (
            students.length > 0 ? (
               <div className="animate-in">
                  <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                     <div className="table-responsive">
                        <table className="table table-bordered align-middle mb-0 text-end">
                           <thead className="bg-light-blue small fw-bold text-primary">
                              <tr style={{ height: '50px' }}>
                                 <th style={{ width: '100px' }}>رقم الطالب</th>
                                 <th style={{ width: '250px' }}>اسم الطالب</th>
                                 <th>التكليف الحالي</th>
                                 <th className="text-center" style={{ width: '150px' }}>توقيع ولي الأمر</th>
                                 <th className="text-center" style={{ width: '150px' }}>توقيع المدرس/ة</th>
                              </tr>
                           </thead>
                           <tbody>
                              {students.map(s => (
                                 <tr key={s.id} style={{ height: '55px' }}>
                                    <td className="font-monospace text-muted small">{s.student_code}</td>
                                    <td className="fw-bold fs-6">{s.name}</td>
                                    <td>
                                       {todayAssignment ? (
                                          <div className="p-2 bg-light rounded text-primary small fw-bold border-start border-3 border-primary">
                                             {todayAssignment.description}
                                          </div>
                                       ) : (
                                          <span className="text-muted opacity-50 x-small italic">لا يوجد تكليف مسجل لليوم</span>
                                       )}
                                    </td>
                                    <td className="text-center">
                                       {s.parent_signed ? (
                                          <div className="text-success animate-in d-flex align-items-center justify-content-center gap-2">
                                             <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
                                                <FontAwesomeIcon icon={faSignature} />
                                             </div>
                                             <span className="small fw-bold">تم التوقيع</span>
                                          </div>
                                       ) : (
                                          <div className="text-muted opacity-50 d-flex align-items-center justify-content-center gap-2">
                                             <FontAwesomeIcon icon={faSignature} className="x-small" />
                                             <span className="x-small italic">بانتظار التوقيع...</span>
                                          </div>
                                       )}
                                    </td>
                                    <td className="text-center">
                                       <button
                                          className={`btn border-0 rounded-circle transition-all shadow-sm ${s.teacher_signed ? 'bg-success text-white' : 'bg-danger bg-opacity-10 text-danger'}`}
                                          style={{ width: '38px', height: '38px' }}
                                          onClick={() => handleGradeChange(s.id, 'teacher_signed', !s.teacher_signed)}
                                          disabled={s.approval_status !== 'pending'}
                                       >
                                          <FontAwesomeIcon icon={s.teacher_signed ? faCheckCircle : faTimesCircle} />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                     {students.some(s => s.approval_status !== 'pending') ? (
                        <div className="alert alert-info py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2">
                           <FontAwesomeIcon icon={faCheckCircle} />
                           <span className="fw-bold fs-6">هذا الكشف معتمد ومقفل من قبل الإدارة (لا يمكن التعديل)</span>
                        </div>
                     ) : (
                        <button className="btn btn-primary px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2" onClick={handleSubmitDaily} disabled={saving}>
                           {saving ? <div className="spinner-border spinner-border-sm"></div> : <FontAwesomeIcon icon={faSave} />}
                           <span className="fw-bold">حفظ ورفع كشف اليوم للمدير</span>
                        </button>
                     )}
                  </div>
               </div>
            ) : (
               <div className="card shadow-sm border-0 p-5 text-center text-muted rounded-4">
                  <FontAwesomeIcon icon={faTasks} size="4x" className="mb-3 opacity-20" />
                  <h5>يرجى اختيار الفصل والمادة لعرض قائمة رصد الحصة</h5>
               </div>
            )
         ) : (
            monthlyStats.length > 0 ? (
               <div className="animate-in">
                  <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                     <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-end">
                           <thead className="bg-light small fw-bold">
                              <tr>
                                 <th className="pr-4">رقم الطالب</th>
                                 <th>اسم الطالب</th>
                                 <th className="text-center">تكاليف سلمت</th>
                                 <th className="text-center">تكاليف لم تسلم</th>
                                 <th className="text-center">معاينة الكشف</th>
                              </tr>
                           </thead>
                           <tbody>
                              {monthlyStats.map(s => (
                                 <tr key={s.id}>
                                    <td className="pr-4 font-monospace text-muted">{s.student_code}</td>
                                    <td><div className="fw-bold">{s.name}</div></td>
                                    <td className="text-center"><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">{s.executed_count}</span></td>
                                    <td className="text-center"><span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">{s.missed_count}</span></td>
                                    <td className="text-center">
                                       <button className="btn btn-sm btn-icon btn-light shadow-sm" onClick={() => setSelectedForPreview(s)}>
                                          <FontAwesomeIcon icon={faEye} className="text-primary" />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="card shadow-sm border-0 p-5 text-center text-muted rounded-4">
                  <FontAwesomeIcon icon={faCalendarAlt} size="4x" className="mb-3 opacity-20" />
                  <h5>يرجى اختيار الفصل والمادة لعرض إحصائيات المتابعة الشهرية</h5>
               </div>
            )
         )}

         {showAddModal && (
            <div className="modal show d-block animate-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', direction: 'rtl' }}>
               <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                     <div className="modal-header bg-primary text-white border-0 py-3">
                        <h5 className="modal-title fw-900 font-cairo"><FontAwesomeIcon icon={faTasks} className="ms-2" /> إضافة تكليف جديد للمادة</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                     </div>
                     <div className="modal-body p-4 bg-light">
                        <div className="row g-3">
                           <div className="col-12">
                              <div className="p-3 bg-white border rounded-3 mb-3 small shadow-sm">
                                 <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted">المدرسة:</span>
                                    <span className="fw-bold">{teacherSchools.find(s => s.id == selectedSchool)?.name}</span>
                                 </div>
                                 <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted">الصف والشعبة:</span>
                                    <span className="fw-bold">{gradeLevels.find(g => g.id == selectedGrade)?.name} - {sections.find(c => c.id == selectedSection)?.name}</span>
                                 </div>
                                 <div className="d-flex justify-content-between">
                                    <span className="text-muted">المادة:</span>
                                    <span className="fw-bold text-primary">{subjects.find(s => s.id == selectedSubject)?.name}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="col-12">
                              <label className="form-label fw-bold small">وصف التكليف (مثال: صـ 25 رقم 1-4)</label>
                              <textarea
                                 className="form-control border-2 shadow-sm"
                                 rows="4"
                                 placeholder="اكتب تفاصيل التكليف المطلوب هنا..."
                                 value={newAssignment}
                                 onChange={(e) => setNewAssignment(e.target.value)}
                              ></textarea>
                           </div>
                        </div>
                     </div>
                     <div className="modal-footer bg-white border-0 py-3">
                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddModal(false)}>إلغاء</button>
                        <button type="button" className="btn btn-primary rounded-pill px-5 shadow fw-bold" onClick={handleAddAssignment} disabled={saving}>
                           {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                           إضافة التكليف الآن
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .modal.show { display: block; backdrop-filter: blur(4px); }
        .font-cairo { font-family: 'Cairo', sans-serif !important; }
        .fw-900 { font-weight: 900; }
        .transition-all { transition: all 0.3s ease; }
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      </div>
   );
};

export default TeacherAttendance;
