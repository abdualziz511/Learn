import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faChild, faChartPie, faCalendarCheck,
  faStar, faExclamationTriangle, faChevronLeft, faBell,
  faCheckCircle, faTimesCircle, faArrowRight,
  faSignature, faPrint, faBook, faUsers
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

// -------------------------------------------------------
// Sub-Component: Homework Sheet (mirrors StudentAssignments exactly)
// Differences: parent signature = interactive button, teacher signature = faSignature blue
// -------------------------------------------------------
const ParentHomeworkSheet = ({ subject, assignments, attendanceRecords, onSign, studentId }) => {
  const [parentNote, setParentNote]     = useState('');
  const [teacherNote, setTeacherNote]   = useState('');
  const [savingNote, setSavingNote]     = useState(false);
  const [noteSaved, setNoteSaved]       = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = new Date().getFullYear();

  useEffect(() => {
    if (!subject?.id || !studentId) return;
    // Fetch parent note
    axiosInstance.get('/parent/notes', {
      params: { student_id: studentId, subject_id: subject.id, month: currentMonth, year: currentYear }
    }).then(r => setParentNote(r.data?.data?.note || '')).catch(() => {});
    // Fetch teacher note
    axiosInstance.get('/parent/notes', {
      params: { student_id: studentId, subject_id: subject.id, month: currentMonth, year: currentYear, type: 'teacher' }
    }).then(r => setTeacherNote(r.data?.data?.note || '')).catch(() => {});
  }, [subject?.id, studentId]);

  const saveNote = async () => {
    setSavingNote(true);
    setNoteSaved(false);
    try {
      await axiosInstance.post('/parent/notes', {
        student_id: studentId,
        subject_id: subject.id,
        month: currentMonth,
        year:  currentYear,
        note:  parentNote
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSavingNote(false);
  };
  const weeksArr = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'];
  const daysArr  = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'];
  const currentMonthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(new Date());
  const teacherName = subject?.teacher_name || '---';

  const rows = weeksArr.flatMap((week, wIdx) =>
    daysArr.map((day, dIdx) => {
      const task       = assignments.find(a => parseInt(a.week_number) === (wIdx + 1) && a.day_name === day);
      const attendance = attendanceRecords.find(r => r.date === task?.date);
      return { week, wIdx, day, dIdx, task, attendance };
    })
  );

  const parentSigned  = attendanceRecords.filter(r => Boolean(r.parent_signed)).length;
  const teacherSigned = attendanceRecords.filter(r => Boolean(r.teacher_signed)).length;
  const total         = assignments.length;

  return (
    <div className="card shadow-lg p-0 overflow-hidden mb-5 animate-in" style={{ borderRadius: '25px', border: '1px solid #dee2e6' }}>
      <div className="bg-white p-4 p-md-5" id="printable-sheet-parent">

        {/* ── Header ── */}
        <div className="d-flex justify-content-center mb-5">
          <div className="d-flex align-items-center border border-2 border-dark rounded-3 px-3 py-1" style={{ width: 'fit-content' }}>
            <div className="px-3 border-start border-2 border-dark font-cairo fw-bold text-nowrap">المادة</div>
            <div className="px-4 text-primary fw-bold font-cairo border-start border-2 border-dark" style={{ minWidth: '150px' }}>
              {subject?.name || '---'}
            </div>
            <div className="px-4 fw-900 fs-4 text-nowrap font-cairo text-white"
                 style={{ backgroundColor: '#1e3a8a', clipPath: 'polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0% 50%)', margin: '0 15px' }}>
              كشف متابعة الواجبات
            </div>
            <div className="px-3 border-start border-2 border-dark font-cairo fw-bold text-nowrap">الشهر</div>
            <div className="px-4 text-primary fw-bold font-cairo" style={{ minWidth: '120px' }}>{currentMonthName}</div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center mb-0"
                 style={{ borderColor: '#334155', minWidth: '800px', direction: 'rtl' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '70px',  border: '2px solid #334155' }}>الأسبوع</th>
                <th style={{ width: '80px',  border: '2px solid #334155' }}>اليوم</th>
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
                    <td rowSpan={daysArr.length} className="fw-bold"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '1rem',
                                 backgroundColor: '#f1f5f9', border: '2px solid #334155' }}>
                      {week}
                    </td>
                  )}
                  <td className="small fw-bold" style={{ border: '2px solid #334155' }}>{day}</td>
                  <td style={{ border: '2px solid #334155' }}>{task?.date || ''}</td>
                  <td className="text-start px-3 fw-bold text-primary"
                      style={{ border: '2px solid #334155', backgroundColor: task ? '#fefce8' : 'transparent' }}>
                    {task?.description || ''}
                  </td>

                  {/* Parent Signature — interactive */}
                  <td style={{ border: '2px solid #334155' }}>
                    {task && (
                      attendance && Boolean(attendance.parent_signed)
                        ? <FontAwesomeIcon icon={faSignature} className="text-success fs-5" />
                        : ( (attendance?.approval_status || 'pending') === 'pending' ? (
                            <button className="btn btn-sm btn-outline-success rounded-pill px-2 py-0 d-print-none"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => onSign(task.date)}>
                              <FontAwesomeIcon icon={faSignature} className="me-1" /> توقيع
                            </button>
                          ) : (
                            <span className="text-muted x-small italic opacity-50">مقفل</span>
                          )
                        )
                    )}
                  </td>

                  {/* Teacher Signature — faSignature blue (different colour) */}
                  <td style={{ border: '2px solid #334155' }}>
                    {task && (
                      attendance && Boolean(attendance.teacher_signed)
                        ? <FontAwesomeIcon icon={faSignature} className="text-primary fs-5" />
                        : <FontAwesomeIcon icon={faTimesCircle} className="text-danger opacity-50" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 row g-0 align-items-center" style={{ direction: 'rtl' }}>
          <div className="col-6">
            <div className="mb-3 d-flex align-items-center gap-2">
              <span className="font-cairo fw-bold">مدرس المادة /</span>
              <div className="flex-grow-1 border-bottom py-1 px-3 fw-bold text-primary"
                   style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{teacherName}</div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="font-cairo fw-bold">ت /</span>
              <div className="w-25 border-bottom text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getDate()}</div>
              <span>/</span>
              <div className="w-25 border-bottom text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getMonth() + 1}</div>
              <span>/</span>
              <div className="w-25 border-bottom text-center" style={{ borderBottomStyle: 'dotted', borderBottomWidth: '2px' }}>{new Date().getFullYear()}</div>
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
                  <td style={{ border: '2px solid #334155' }} className="fw-bold py-1 small">توقيع ولي الأمر</td>
                </tr>
                <tr style={{ height: '40px' }}>
                  <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6">{total}</td>
                  <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6 text-success">{teacherSigned}</td>
                  <td style={{ border: '2px solid #334155' }} className="fw-bold fs-6 text-danger">{total - teacherSigned}</td>
                  <td style={{ border: '2px solid #334155' }} className="fw-bold fs-5 text-primary">{parentSigned}/{total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="mt-4 pt-3" style={{ direction: 'rtl' }}>

          {/* Teacher note — read-only for parent */}
          <div className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fw-bold font-cairo small">ملاحظات المربية :</span>
            </div>
            <div className="border rounded-3 px-3 py-2 bg-light text-muted small font-cairo"
                 style={{ minHeight: '40px', borderStyle: 'dotted !important', borderColor: '#94a3b8' }}>
              {teacherNote || <span className="opacity-50">لا توجد ملاحظات من المعلم بعد</span>}
            </div>
          </div>

          {/* Parent note — editable */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-bold font-cairo small">ملاحظات ولي الأمر :</span>
              {noteSaved && (
                <span className="badge bg-success bg-opacity-10 text-success x-small font-cairo">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> تم الحفظ
                </span>
              )}
            </div>
            <textarea
              className="form-control border rounded-3 font-cairo small d-print-none"
              rows={2}
              placeholder={ (attendanceRecords[0]?.approval_status || 'pending') !== 'pending' ? "تم إغلاق التعديل لاعتماد الكشف" : "اكتب ملاحظتك هنا..." }
              style={{ direction: 'rtl', borderStyle: 'dashed', resize: 'vertical' }}
              value={parentNote}
              onChange={e => setParentNote(e.target.value)}
              disabled={(attendanceRecords[0]?.approval_status || 'pending') !== 'pending'}
            />
            {/* Print version */}
            <div className="d-none d-print-block border-bottom pb-1 font-cairo small" style={{ minHeight: '35px' }}>
              {parentNote}
            </div>
            <div className="d-flex justify-content-end mt-2 d-print-none">
              {(attendanceRecords[0]?.approval_status || 'pending') === 'pending' && (
                <button
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-bold font-cairo"
                  onClick={saveNote}
                  disabled={savingNote}
                >
                  {savingNote
                    ? <><span className="spinner-border spinner-border-sm ms-2"></span> جاري الحفظ...</>
                    : <><FontAwesomeIcon icon={faSignature} className="ms-2" /> حفظ الملاحظة</>
                  }
                </button>
              )}
              {(attendanceRecords[0]?.approval_status || 'pending') !== 'pending' && (
                <div className="badge bg-secondary bg-opacity-10 text-secondary p-2 rounded-pill small font-cairo">
                   <FontAwesomeIcon icon={faLock} className="ms-1" /> هذا الكشف معتمد ومقفل
                </div>
              )}
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

// -------------------------------------------------------
// Main Component: Parent Dashboard
// -------------------------------------------------------
const ParentDashboard = () => {
  const [children,         setChildren]         = useState([]);
  const [selectedChild,    setSelectedChild]    = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [currentView,      setCurrentView]      = useState('dashboard');
  const [subjects,         setSubjects]         = useState([]);
  const [selectedSubject,  setSelectedSubject]  = useState(null);
  const [assignments,      setAssignments]      = useState([]);
  const [attendanceRecords,setAttendanceRecords]= useState([]);
  const [loadingSheet,     setLoadingSheet]     = useState(false);
  const [globalStats,      setGlobalStats]      = useState({ performance: 0, attendance: 0 });

  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    if (selectedSubject && selectedChild && currentView === 'followup') {
      fetchSheetData(selectedChild.id, selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res  = await axiosInstance.get('/parent/children');
      const data = res.data?.data || [];
      setChildren(data);
      if (data.length > 0) {
        const avgPerf = data.reduce((a, c) => a + parseInt(c.performance || 0), 0) / data.length;
        const avgAtt  = data.reduce((a, c) => a + parseInt(c.attendance  || 0), 0) / data.length;
        setGlobalStats({ performance: Math.round(avgPerf), attendance: Math.round(avgAtt) });
        setSelectedChild(data[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const enterFollowup = async (child) => {
    setSelectedChild(child);
    setCurrentView('followup');
    setAssignments([]);
    setAttendanceRecords([]);
    setSelectedSubject(null);
    try {
      const res = await axiosInstance.get(`/parent/children/${child.id}/subjects`);
      const subs = res.data?.data || [];
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0]);
    } catch (e) { console.error(e); }
  };

  const fetchSheetData = async (childId, subId) => {
    setLoadingSheet(true);
    try {
      const res = await axiosInstance.get(`/parent/children/${childId}/subjects/${subId}/assignments`);
      setAssignments(res.data?.data?.assignments || []);
      setAttendanceRecords(res.data?.data?.attendance_records || []);
    } catch (e) { console.error(e); }
    setLoadingSheet(false);
  };

  const handleSign = async (date) => {
    if (!selectedChild || !selectedSubject) return;
    try {
      const res = await axiosInstance.post('/parent/sign-assignment', {
        student_id: selectedChild.id,
        subject_id: selectedSubject.id,
        date
      });
      if (res.data?.status === 'success') {
        Swal.fire({ title: 'تم التوقيع بنجاح', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchSheetData(selectedChild.id, selectedSubject.id);
      }
    } catch (e) { Swal.fire('خطأ', 'فشل التوقيع', 'error'); }
  };

  if (loading) return (
    <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
      <div className="spinner-border text-primary"></div>
      <div className="fw-bold font-cairo">جاري جلب بيانات العائلة...</div>
    </div>
  );

  return (
    <div className="animate-in pb-5">

      {/* ── Hero ── */}
      <div className="page-hero mb-4 rounded-4 shadow-sm text-white p-4"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', direction: 'rtl' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-900 mb-1 font-cairo">
              {currentView === 'dashboard' ? 'لوحة المعلومات العائلية' : `متابعة: ${selectedChild?.name}`}
            </h3>
            <p className="mb-0 opacity-75 small font-cairo">
              {currentView === 'dashboard' ? 'نظرة شمولية على أداء جميع الأبناء' : 'كشف المهام الشهري والتوقيعات الرقمية'}
            </p>
          </div>
          {currentView !== 'dashboard' && (
            <button className="btn btn-light rounded-pill px-4 btn-sm fw-bold font-cairo d-print-none"
                    onClick={() => setCurrentView('dashboard')}>
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" /> العودة للرئيسية
            </button>
          )}
        </div>
      </div>

      {currentView === 'dashboard' ? (
        <div style={{ direction: 'rtl' }}>

          {/* ── Global KPIs ── */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                       style={{ width: '45px', height: '45px' }}>
                    <FontAwesomeIcon icon={faChartPie} />
                  </div>
                  <div>
                    <div className="x-small fw-bold font-cairo text-muted mb-0">متوسط التحصيل</div>
                    <div className="h4 fw-900 mb-0 font-monospace text-primary">{globalStats.performance}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                       style={{ width: '45px', height: '45px' }}>
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </div>
                  <div>
                    <div className="x-small fw-bold font-cairo text-muted mb-0">متوسط الحضور</div>
                    <div className="h4 fw-900 mb-0 font-monospace text-success">{globalStats.attendance}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-dark bg-opacity-10 text-dark d-flex align-items-center justify-content-center"
                       style={{ width: '45px', height: '45px' }}>
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div>
                    <div className="x-small fw-bold font-cairo text-muted mb-0">عدد الأبناء</div>
                    <div className="h4 fw-900 mb-0 font-monospace text-dark">{children.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Children Cards ── */}
          <h6 className="fw-bold mb-3 font-cairo text-muted">
            <FontAwesomeIcon icon={faChild} className="ms-2" /> أداء الأبناء الفردي
          </h6>
          <div className="row g-3">
            {children.map(child => (
              <div key={child.id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 transition-hover h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center shadow-sm"
                             style={{ width: '48px', height: '48px' }}>
                          <FontAwesomeIcon icon={faUserCircle} size="lg" />
                        </div>
                        <div>
                          <h6 className="fw-900 mb-0 font-cairo">{child.name}</h6>
                          <div className="x-small text-muted font-cairo">{child.grade} — {child.school}</div>
                        </div>
                      </div>
                      <button className="btn btn-outline-primary rounded-pill btn-sm px-3 font-cairo fw-bold"
                              onClick={() => enterFollowup(child)}>
                        لوحة المتابعة <FontAwesomeIcon icon={faChevronLeft} className="ms-1" />
                      </button>
                    </div>
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-3">
                          <div className="x-small text-muted font-cairo">التحصيل</div>
                          <div className={`fw-bold ${parseInt(child.performance) >= 90 ? 'text-success' : 'text-primary'}`}>{child.performance}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-3">
                          <div className="x-small text-muted font-cairo">الحضور</div>
                          <div className="fw-bold text-success">{child.attendance}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-3">
                          <div className="x-small text-muted font-cairo">السلوك</div>
                          <div className="fw-bold text-warning">جيد جداً</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* ── Followup View ── */
        <div className="row g-4" style={{ direction: 'rtl' }}>

          {/* Subjects sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style={{ top: '1rem' }}>
              <div className="card-header bg-light py-3 border-0">
                <h6 className="mb-0 fw-bold font-cairo">
                  <FontAwesomeIcon icon={faBook} className="ms-2 text-primary" /> المواد الدراسية
                </h6>
              </div>
              <div className="list-group list-group-flush">
                {subjects.map(s => (
                  <button key={s.id} onClick={() => setSelectedSubject(s)}
                          className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center justify-content-between font-cairo
                            ${selectedSubject?.id === s.id ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}>
                    <span>{s.name}</span>
                    <FontAwesomeIcon icon={faChevronLeft} className={`x-small ${selectedSubject?.id === s.id ? 'text-primary' : 'opacity-20'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sheet area */}
          <div className="col-lg-9">
            {selectedSubject ? (
              loadingSheet ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
              ) : (
                <div className="animate-in">
                  {/* Subject Stats */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-primary border-4">
                        <div className="d-flex align-items-center gap-2 mb-1 text-primary">
                          <FontAwesomeIcon icon={faSignature} className="small" />
                          <span className="x-small fw-bold font-cairo">بصمة ولي الأمر</span>
                        </div>
                        <div className="h4 fw-900 mb-0 font-monospace">
                          {attendanceRecords.filter(r => r.parent_signed).length} / {assignments.length}
                        </div>
                        <div className="x-small text-muted font-cairo mt-1">تكاليف تم التوقيع عليها</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-success border-4">
                        <div className="d-flex align-items-center gap-2 mb-1 text-success">
                          <FontAwesomeIcon icon={faCheckCircle} className="small" />
                          <span className="x-small fw-bold font-cairo">توثيق المعلم</span>
                        </div>
                        <div className="h4 fw-900 mb-0 font-monospace">
                          {Math.round((attendanceRecords.filter(r => r.teacher_signed).length / (assignments.length || 1)) * 100)}%
                        </div>
                        <div className="x-small text-muted font-cairo mt-1">نسبة اعتماد المعلم</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-warning border-4">
                        <div className="d-flex align-items-center gap-2 mb-1 text-warning">
                          <FontAwesomeIcon icon={faStar} className="small" />
                          <span className="x-small fw-bold font-cairo">معدل الإنجاز</span>
                        </div>
                        <div className="h4 fw-900 mb-0 font-monospace">
                          {attendanceRecords.filter(r => (r.homework_score || 0) > 0).length} / {assignments.length}
                        </div>
                        <div className="x-small text-muted font-cairo mt-1">الواجبات المنفذة فعلياً</div>
                      </div>
                    </div>
                  </div>

                  <ParentHomeworkSheet
                    subject={selectedSubject}
                    assignments={assignments}
                    attendanceRecords={attendanceRecords}
                    onSign={handleSign}
                    studentId={selectedChild?.id}
                  />
                </div>
              )
            ) : (
              <div className="card border-0 shadow-sm p-5 text-center text-muted rounded-4 bg-white">
                <FontAwesomeIcon icon={faBook} size="4x" className="mb-4 opacity-10" />
                <h5 className="font-cairo opacity-50">اختر مادة لعرض الكشف الشهري</h5>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .font-cairo  { font-family: 'Cairo', sans-serif !important; }
        .fw-900      { font-weight: 900; }
        .x-small     { font-size: 0.72rem; }
        .transition-hover { transition: all .3s ease; }
        .transition-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.08) !important; }
        .animate-in  { animation: fadeInUp .45s ease-out; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @media print { .d-print-none { display:none !important; } }
      `}</style>
    </div>
  );
};

export default ParentDashboard;
