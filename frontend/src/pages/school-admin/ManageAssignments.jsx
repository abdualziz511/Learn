import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faTrash, faChalkboardTeacher, faBook, faUsers, 
  faLayerGroup, faChartPie, faSearch, faInfoCircle, faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageAssignments = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const primaryColor = '#7367f0';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, aRes] = await Promise.all([
        axiosInstance.get('/school-admin/teachers'),
        axiosInstance.get('/school-admin/classes'),
        axiosInstance.get('/school-admin/subjects'),
        axiosInstance.get('/school-admin/assignments')
      ]);
      setTeachers(tRes.data?.data || []);
      setClasses(cRes.data?.data || []);
      setSubjects(sRes.data?.data || []);
      setAssignments(aRes.data?.data || []);
    } catch (e) {
      console.error(e);
      Swal.fire('خطأ', 'تعذر جلب البيانات من السيرفر', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (asn) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم إلغاء إسناد مادة ${asn.subject_name} من المعلم ${asn.teacher_name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7367f0',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/school-admin/teachers/${asn.teacher_id}?assignment_id=${asn.id}`);
          fetchData();
          Swal.fire('تم الحذف', 'تم إلغاء الإسناد بنجاح', 'success');
        } catch (err) {
          Swal.fire('خطأ', 'فشل في عملية الحذف', 'error');
        }
      }
    });
  };

  const handleAddAssignment = () => {
    Swal.fire({
      title: 'إسناد مهمة أكاديمية جديدة',
      html: `
        <div class="text-start mb-3" style="font-family: 'Cairo', sans-serif; direction: rtl;">
          <label class="x-small fw-bold text-muted mb-1 d-block pe-2">1. اختر المعلم</label>
          <select id="sw_teacher_id" class="form-select border-0 bg-light py-2 rounded-3 text-end">
            <option value="">-- اختر المعلم --</option>
            ${teachers.map(t => `<option value="${t.id}">${t.name} (${t.specialization || 'لا يوجد تخصص'})</option>`).join('')}
          </select>
        </div>
        <div class="text-start mb-3" style="font-family: 'Cairo', sans-serif; direction: rtl;">
          <label class="x-small fw-bold text-muted mb-1 d-block pe-2">2. اختر الصف والشعبة</label>
          <select id="sw_class_id" class="form-select border-0 bg-light py-2 rounded-3 text-end">
            <option value="">-- اختر الفصل --</option>
            ${classes.map(c => `<option value="${c.id}">${c.grade_level_name || 'صف عام'} - ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="text-start mb-3" style="font-family: 'Cairo', sans-serif; direction: rtl;">
          <label class="x-small fw-bold text-muted mb-1 d-block pe-2">3. المادة الدراسية</label>
          <select id="sw_subject_id" class="form-select border-0 bg-light py-2 rounded-3 text-end">
            <option value="">-- اختر المادة --</option>
            ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'إتمام الإسناد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#7367f0',
      preConfirm: () => {
        const t_id = document.getElementById('sw_teacher_id').value;
        const c_id = document.getElementById('sw_class_id').value;
        const s_id = document.getElementById('sw_subject_id').value;
        if (!t_id || !c_id || !s_id) {
          Swal.showValidationMessage('يرجى اختيار المعلم والفصل والمادة');
          return false;
        }
        return { teacher_id: t_id, class_id: c_id, subject_id: s_id };
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axiosInstance.post(`/school-admin/teachers/${res.value.teacher_id}/assign`, res.value);
          fetchData();
          Swal.fire({ title: 'تمت العملية', text: 'تم إسناد المهمة بنجاح', icon: 'success', confirmButtonColor: '#7367f0' });
        } catch (err) {
          Swal.fire('خطأ', err.response?.data?.message || 'فشل في الإسناد', 'error');
        }
      }
    });
  };

  const filtered = assignments.filter(a => {
    const matchSearch = (a.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (a.subject_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = filterGrade === '' || a.grade_level_name === filterGrade;
    return matchSearch && matchGrade;
  });

  const uniqueGrades = [...new Set(assignments.map(a => a.grade_level_name).filter(Boolean))];

  return (
    <div className="animate__animated animate__fadeIn">
      <style>
        {`
          .bg-primary { background-color: #7367f0 !important; }
          .text-primary { color: #7367f0 !important; }
          .btn-primary { background-color: #7367f0 !important; border-color: #7367f0 !important; }
          .bg-primary-soft { background-color: #7367f015 !important; }
          .bg-success-soft { background-color: #28c76f15 !important; }
          .bg-warning-soft { background-color: #ff9f4315 !important; }
          .bg-danger-soft { background-color: #ea545515 !important; }
          .text-success { color: #28c76f !important; }
          .text-warning { color: #ff9f43 !important; }
          .text-danger { color: #ea5455 !important; }
          .rounded-5 { border-radius: 1.5rem !important; }
          .x-small { font-size: 11px; }
          .fw-900 { font-weight: 900; }
          .hover-shadow:hover { transform: translateY(-5px); transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          .btn-danger-soft { background-color: #ea545515; color: #ea5455; border: none; }
          .btn-danger-soft:hover { background-color: #ea5455; color: white; }
        `}
      </style>

      {/* Hero Header */}
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>نصاب المعلمين والأنصبة</h2>
            <p className="mb-0 opacity-80 small">توزيع وإدارة المهام الدراسية للمعلمين بذكاء</p>
          </div>
          <button className="btn btn-white text-primary fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={handleAddAssignment}>
             <FontAwesomeIcon icon={faPlus} className="ms-2" /> إسناد مهمة جديدة
          </button>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4 text-end" style={{ direction: 'rtl' }}>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div className="bg-primary-soft text-primary rounded-circle p-3"><FontAwesomeIcon icon={faChalkboardTeacher} /></div>
              <div className="text-end">
                <div className="text-muted x-small">إجمالي المعلمين</div>
                <div className="fw-900 h5 mb-0 text-dark">{teachers.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div className="bg-warning-soft text-warning rounded-circle p-3"><FontAwesomeIcon icon={faChartPie} /></div>
              <div className="text-end">
                <div className="text-muted x-small">الأنصبة المسندة</div>
                <div className="fw-900 h5 mb-0 text-dark">{assignments.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div className="bg-success-soft text-success rounded-circle p-3"><FontAwesomeIcon icon={faLayerGroup} /></div>
              <div className="text-end">
                <div className="text-muted x-small">الصفوف المغطاة</div>
                <div className="fw-900 h5 mb-0 text-dark">{classes.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow h-100 bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <div className="bg-white bg-opacity-20 rounded-circle p-3"><FontAwesomeIcon icon={faUserCheck} /></div>
              <div className="text-end">
                <div className="opacity-75 x-small">حالة التغطية</div>
                <div className="fw-bold h6 mb-0">النظام مستقر</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center text-end" style={{ direction: 'rtl' }}>
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-0 bg-light py-2 px-3 shadow-none text-end" 
                placeholder="ابحث عن معلم أو مادة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select border-0 bg-light py-2 shadow-none text-end" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
              <option value="">جميع الصفوف</option>
              {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="col-md-4 text-start">
            <button className="btn btn-light rounded-pill px-4 border-0 text-muted small" onClick={fetchData}>
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2" /> تحديث البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeInUp">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-end" style={{ fontSize: '13px', direction: 'rtl' }}>
            <thead className="bg-primary text-white">
              <tr>
                <th className="pr-4 py-3 border-0 fw-bold px-4">المعلم والتخصص</th>
                <th className="py-3 border-0 fw-bold">المادة الدراسية</th>
                <th className="py-3 border-0 fw-bold">الصف / الشعبة</th>
                <th className="text-center border-0 fw-bold px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary opacity-50"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((a, i) => (
                  <tr key={i} className="border-bottom-soft transition-all">
                    <td className="pr-4 py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-soft text-primary ml-2 ms-2 rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px' }}>
                          <FontAwesomeIcon icon={faChalkboardTeacher} style={{ fontSize: '12px' }} />
                        </div>
                        <div className="text-start">
                          <div className="fw-bold text-dark">{a.teacher_name}</div>
                          <div className="x-small text-muted">{a.teacher_specialization || 'لا يوجد تخصص'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '11px' }}>
                          <FontAwesomeIcon icon={faBook} className="ml-2 ms-2 opacity-50" />
                          {a.subject_name}
                       </span>
                    </td>
                    <td>
                       <div className="d-flex flex-column">
                          <span className="fw-bold text-dark">{a.grade_level_name}</span>
                          <span className="x-small text-muted badge bg-light text-dark rounded-pill py-1 mt-1 border-0" style={{ maxWidth: 'fit-content' }}>
                             <FontAwesomeIcon icon={faUsers} className="ml-1 ms-1 opacity-50" /> شعبة: {a.class_name}
                          </span>
                       </div>
                    </td>
                    <td className="text-center px-4">
                       <button className="btn btn-danger-soft btn-sm rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }} title="إلغاء الإسناد" onClick={() => handleDelete(a)}>
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="opacity-20 mb-2"><FontAwesomeIcon icon={faChalkboardTeacher} size="3x" /></div>
                    <div className="text-muted fw-bold">لا يوجد أنصبة مطابقة لمعايير البحث</div>
                    <button className="btn btn-link btn-sm text-primary x-small mt-2" onClick={() => { setSearchTerm(''); setFilterGrade(''); }}>إعادة ضبط الفلتر</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAssignments;
