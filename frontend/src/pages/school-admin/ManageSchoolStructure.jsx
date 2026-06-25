import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faTrash, faEdit, faLayerGroup, faUsers, faTag, faCogs, 
  faArrowRight, faUserGraduate, faChalkboard, faBookOpen, faSearch, faUserPlus, faEye, faBook, faFolderOpen, faFilePdf, faLink, faFileWord, faFilePowerpoint
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ManageSchoolStructure = () => {
  const [selectedGrade, setSelectedGrade] = useState(null); // The Grade Object being managed
  const [activeTab, setActiveTab] = useState('students'); // students, sections, term1, term2
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data for the managed grade
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchGradeDetails();
    }
  }, [selectedGrade, activeTab]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/school-admin/grade-levels');
      setGrades(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGradeDetails = async () => {
    setSubLoading(true);
    try {
      // Always fetch sections if we have a grade selected, they are needed for modals
      const secRes = await axiosInstance.get(`/school-admin/classes?grade_level_id=${selectedGrade.id}`);
      setSections(secRes.data?.data || []);

      if (activeTab === 'students') {
        const res = await axiosInstance.get(`/school-admin/students?grade_level_id=${selectedGrade.id}`);
        setStudents(res.data?.data || []);
      } else if (activeTab === 'term1' || activeTab === 'term2') {
        const res = await axiosInstance.get(`/school-admin/subjects?grade_level_id=${selectedGrade.id}`);
        setSubjects(res.data?.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setSubLoading(false); }
  };

  const handleManageGrade = (grade) => {
    setSections([]); // Reset sections when changing grade
    setSelectedGrade(grade);
    setActiveTab('students');
  };

  const handleBack = () => {
    setSelectedGrade(null);
    fetchGrades();
  };

  // --- Student Actions ---
  const handleAddStudent = () => {
    Swal.fire({
      title: 'إضافة ملف طالب جديد',
      width: '700px',
      html: `
        <div class="row g-3 text-start">
            <div class="col-md-6">
                <label class="form-label fw-bold small">الاسم الكامل (رباعي)</label>
                <div class="input-group">
                    <span class="input-group-text bg-light border-0"><i class="fas fa-user text-muted"></i></span>
                    <input id="stu_name" class="form-control bg-light border-0" placeholder="اسم الطالب الكامل">
                </div>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الرقم الأكاديمي</label>
                <input id="stu_code" class="form-control bg-light border-0" placeholder="اتركه فارغاً للتوليد التلقائي">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">البريد الإلكتروني</label>
                <input id="stu_email" class="form-control bg-light border-0" placeholder="stu@school.com">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">هاتف ولي الأمر</label>
                <input id="parent_phone" class="form-control bg-light border-0" placeholder="05xxxxxxxx">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">تاريخ الميلاد</label>
                <input id="stu_dob" type="date" class="form-control bg-light border-0">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الجنس</label>
                <select id="stu_gender" class="form-select bg-light border-0">
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                </select>
            </div>
            <div class="col-12">
                <label class="form-label fw-bold small">العنوان الحالي</label>
                <textarea id="stu_address" class="form-control bg-light border-0" rows="2" placeholder="المدينة، الحي..."></textarea>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الشعبة المقترحة</label>
                <select id="section_id" class="form-select bg-light border-0">
                    <option value="">-- بدون شعبة (بانتظار توزيع) --</option>
                    ${sections.map(s => `<option value="${s.id}">شعبة ${s.name}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">كلمة المرور للدخول</label>
                <input id="stu_password" type="password" class="form-control bg-light border-0" value="12345678">
            </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check me-2"></i> تدشين حساب الطالب',
      cancelButtonText: 'إلغاء',
      customClass: {
          confirmButton: 'btn btn-primary px-5 py-2 rounded-pill shadow-sm',
          cancelButton: 'btn btn-light px-5 py-2 rounded-pill'
      },
      preConfirm: () => ({
        name: document.getElementById('stu_name').value,
        email: document.getElementById('stu_email').value,
        student_code: document.getElementById('stu_code').value,
        parent_phone: document.getElementById('parent_phone').value,
        date_of_birth: document.getElementById('stu_dob').value,
        gender: document.getElementById('stu_gender').value,
        address: document.getElementById('stu_address').value,
        section_id: document.getElementById('section_id').value,
        grade_level_id: selectedGrade.id,
        password: document.getElementById('stu_password').value
      })
    }).then(async (res) => {
      if (res.isConfirmed && res.value.name) {
        try {
          await axiosInstance.post('/school-admin/students', res.value);
          fetchGradeDetails();
          Swal.fire({
            icon: 'success', title: 'تم الحفظ', text: 'تمت إضافة الطالب للمنظومة بنجاح',
            timer: 2000, showConfirmButton: false
          });
        } catch (err) { 
            const msg = err.response?.data?.message || 'فشل إضافة الطالب';
            Swal.fire('خطأ', msg, 'error'); 
        }
      }
    });
  };

  const handleViewStudent = (student) => {
    Swal.fire({
        title: `<div class="d-flex align-items-center gap-3 mb-2 px-3 pt-3">
                    <div class="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width:70px; height:70px; font-size: 30px; border: 4px solid #fff;">${student.name?.[0]}</div>
                    <div class="text-start">
                        <h4 class="mb-0 fw-900 text-dark">${student.name}</h4>
                        <span class="badge bg-primary-soft text-primary rounded-pill px-3 mt-1">${student.student_code}</span>
                    </div>
                </div>`,
        html: `
            <div class="px-3 pb-3">
                <div class="card border-0 bg-light rounded-4 text-start overflow-hidden shadow-sm">
                    <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-white bg-opacity-50">
                        <span class="text-muted small fw-bold"><i class="fas fa-id-card me-1"></i> الملف الشخصي الكامل</span>
                        <span class="badge bg-success-subtle text-success rounded-pill px-3">${student.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </div>
                    <div class="p-4 bg-white">
                        <div class="row g-4">
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">البريد الإلكتروني</label>
                                <div class="fw-bold text-dark text-truncate">${student.email || '----'}</div>
                            </div>
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">هاتف ولي الأمر</label>
                                <div class="fw-bold text-dark">${student.parent_phone}</div>
                            </div>
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">تاريخ الميلاد</label>
                                <div class="fw-bold text-dark">${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('ar-SA') : 'غير مسجل'}</div>
                            </div>
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">الجنس</label>
                                <div class="fw-bold text-dark">${student.gender === 'male' ? 'ذكر' : student.gender === 'female' ? 'أنثى' : '----'}</div>
                            </div>
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">الصف</label>
                                <div class="fw-bold text-primary">${selectedGrade.name}</div>
                            </div>
                            <div class="col-6">
                                <label class="text-muted x-small d-block mb-1">الشعبة</label>
                                <div class="fw-bold text-info">${student.class_name || 'بانتظار توزيع'}</div>
                            </div>
                            <div class="col-12">
                                <label class="text-muted x-small d-block mb-1">العنوان</label>
                                <div class="p-2 bg-light rounded-3 text-muted small">${student.address || 'لا يوجد عنوان مسجل'}</div>
                            </div>
                            <div class="col-12 mt-2">
                                <div class="d-flex justify-content-between p-3 bg-primary-soft rounded-3 border border-primary border-opacity-10">
                                    <div class="text-center flex-grow-1">
                                        <div class="text-muted x-small">تاريخ التسجيل</div>
                                        <div class="fw-bold text-primary small">${student.enrolled_at}</div>
                                    </div>
                                    <div class="vr mx-3 opacity-25"></div>
                                    <div class="text-center flex-grow-1">
                                        <div class="text-muted x-small">عدد الغيابات</div>
                                        <div class="fw-bold text-danger small">0 حصة</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: '550px',
        showCloseButton: true,
        showConfirmButton: false,
        padding: '0',
        customClass: {
            container: 'modern-swal-container',
            popup: 'rounded-5 border-0 shadow-lg overflow-hidden'
        }
    });
  };

  const handleEditStudent = (student) => {
    Swal.fire({
      title: 'تعديل الملف الأكاديمي',
      width: '650px',
      html: `
        <div class="row g-3 text-start">
            <div class="col-md-6">
                <label class="form-label fw-bold small">الاسم الكامل</label>
                <div class="input-group">
                    <span class="input-group-text bg-light border-0"><i class="fas fa-user text-muted"></i></span>
                    <input id="edit_stu_name" class="form-control bg-light border-0" value="${student.name}">
                </div>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الرقم الأكاديمي</label>
                <input id="edit_stu_code" class="form-control bg-light border-0" value="${student.student_code}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">البريد الإلكتروني</label>
                <input id="edit_stu_email" class="form-control bg-light border-0" value="${student.email || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">رقم ولي الأمر</label>
                <input id="edit_parent_phone" class="form-control bg-light border-0" value="${student.parent_phone}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">تاريخ الميلاد</label>
                <input id="edit_stu_dob" type="date" class="form-control bg-light border-0" value="${student.date_of_birth || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الجنس</label>
                <select id="edit_stu_gender" class="form-select bg-light border-0">
                    <option value="male" ${student.gender==='male'?'selected':''}>ذكر</option>
                    <option value="female" ${student.gender==='female'?'selected':''}>أنثى</option>
                </select>
            </div>
            <div class="col-12">
                <label class="form-label fw-bold small">عنوان السكن</label>
                <textarea id="edit_stu_address" class="form-control bg-light border-0" rows="2">${student.address || ''}</textarea>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">الشعبة</label>
                <select id="edit_stu_section" class="form-select bg-light border-0">
                    <option value="">-- بدون شعبة --</option>
                    ${sections.map(sec => `<option value="${sec.id}" ${student.class_id==sec.id?'selected':''}>شعبة ${sec.name}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold small">حالة الطالب</label>
                <select id="edit_stu_status" class="form-select bg-light border-0">
                    <option value="active" ${student.status==='active'?'selected':''}>نشط</option>
                    <option value="suspended" ${student.status==='suspended'?'selected':''}>موقوف</option>
                    <option value="transferred" ${student.status==='transferred'?'selected':''}>منقول</option>
                    <option value="graduated" ${student.status==='graduated'?'selected':''}>متخرج</option>
                </select>
            </div>
            <div class="col-12 mt-4 px-3 py-2 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25">
                <label class="form-label fw-bold small text-warning mb-0">تغيير كلمة المرور (اختياري)</label>
                <input id="edit_stu_pass" type="password" class="form-control border-0 bg-white mt-1" placeholder="اتركها فارغة إذا لم تود تغييرها">
            </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save me-2"></i> حفظ التحديثات',
      cancelButtonText: 'إلغاء',
      customClass: {
          confirmButton: 'btn btn-primary px-5 py-2 rounded-pill shadow-sm',
          cancelButton: 'btn btn-light px-5 py-2 rounded-pill'
      },
      preConfirm: () => ({
        name: document.getElementById('edit_stu_name').value,
        student_code: document.getElementById('edit_stu_code').value,
        email: document.getElementById('edit_stu_email').value,
        parent_phone: document.getElementById('edit_parent_phone').value,
        date_of_birth: document.getElementById('edit_stu_dob').value,
        gender: document.getElementById('edit_stu_gender').value,
        address: document.getElementById('edit_stu_address').value,
        class_id: document.getElementById('edit_stu_section').value,
        status: document.getElementById('edit_stu_status').value,
        password: document.getElementById('edit_stu_pass').value
      })
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axiosInstance.put(`/school-admin/students/${student.id}`, res.value);
          fetchGradeDetails();
          Swal.fire({
              icon: 'success', title: 'تم الحفظ', text: 'تم تحديث الملف الأكاديمي للطالب بنجاح',
              timer: 2000, showConfirmButton: false
          });
        } catch (e) { 
            const msg = e.response?.data?.message || 'فشل التحديث';
            Swal.fire('خطأ', msg, 'error'); 
        }
      }
    });
  };

  const handleImportExcel = () => {
    Swal.fire({
      title: 'استيراد طلاب من ملف إكسل',
      html: `
        <div class="text-start p-2">
          <div class="alert alert-info py-2 rounded-3 small mb-3">
             <i class="fas fa-info-circle me-1"></i> يرجى استخدام القالب المعتمد لضمان دقة البيانات.
          </div>
          <div class="mb-3">
             <label class="form-label small fw-bold">1. تحميل القالب</label>
             <button id="download-template" class="btn btn-outline-primary btn-sm w-100 rounded-pill">
                <i class="fas fa-download me-1"></i> تحميل قالب الإكسل (CSV)
             </button>
          </div>
          <div class="mb-3">
             <label class="form-label small fw-bold">2. اختيار ملف البيانات</label>
             <input type="file" id="excel-file" class="form-control form-control-sm" accept=".xlsx, .xls, .csv">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'بدء الاستيراد الآن',
      cancelButtonText: 'إلغاء',
      didOpen: () => {
        document.getElementById('download-template').onclick = () => {
          const headers = "الاسم كامل,البريد الالكتروني,هاتف ولي الامر,الجنس(male/female),تاريخ الميلاد(YYYY-MM-DD),العنوان\n";
          const blob = new Blob(["\uFEFF" + headers], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `قالب_استيراد_طلاب_${selectedGrade.name}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('excel-file');
        const file = fileInput.files[0];
        if (!file) {
          Swal.showValidationMessage('يرجى اختيار الملف أولاً');
          return false;
        }
        
        try {
          // Load XLSX dynamically if not already loaded
          if (!window.XLSX) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const data = e.target.result;
              const workbook = window.XLSX.read(data, { type: 'binary', codepage: 65001 });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              
              // Use raw array-of-arrays first to detect headers
              const rawArr = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
              
              // Clean BOM and whitespace from all header keys
              const headers = (rawArr[0] || []).map(h => 
                String(h).replace(/^\uFEFF/, '').trim()
              );
              
              // Build objects from rows using cleaned headers
              const json = rawArr.slice(1)
                .filter(row => row.some(cell => cell !== ''))
                .map(row => {
                  const obj = {};
                  headers.forEach((h, i) => { obj[h] = row[i]; });
                  return obj;
                });
              
              console.log('[Excel Import] Headers detected:', headers);
              console.log('[Excel Import] First row sample:', json[0]);
              
              resolve({ json, headers });
            };
            reader.readAsBinaryString(file);
          });
        } catch (err) {
          Swal.showValidationMessage('فشل في قراءة ملف الإكسل');
          return false;
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { json: rawData, headers } = result.value;
        
        // Flexible column finder: exact → partial → index fallback
        const findCol = (row, possibleKeys, fallbackIndex = null) => {
          // 1. Exact match
          let key = Object.keys(row).find(k => possibleKeys.includes(k.trim()));
          if (key) return row[key];
          // 2. Partial match (contains any keyword)
          key = Object.keys(row).find(k => possibleKeys.some(pk => k.trim().includes(pk) || pk.includes(k.trim())));
          if (key) return row[key];
          // 3. Index fallback using headers array
          if (fallbackIndex !== null && headers[fallbackIndex] !== undefined) {
            return row[headers[fallbackIndex]];
          }
          return null;
        };

        const validData = rawData.map(row => ({
          name:          findCol(row, ['الاسم كامل', 'الاسم', 'name', 'Full Name'], 0),
          email:         findCol(row, ['البريد الالكتروني', 'البريد', 'email', 'Email'], 1),
          parent_phone:  findCol(row, ['هاتف ولي الامر', 'الهاتف', 'parent_phone', 'Phone'], 2),
          gender:        findCol(row, ['الجنس', 'gender', 'Gender'], 3) || 'male',
          date_of_birth: findCol(row, ['تاريخ الميلاد', 'date_of_birth', 'dob', 'DOB'], 4),
          address:       findCol(row, ['العنوان', 'address', 'Address'], 5),
          grade_level_id: selectedGrade.id,
          password: 'password'
        })).filter(r => r.name);

        if (validData.length === 0) {
           Swal.fire('تنبيه', 'الملف المرفوع لا يحتوي على بيانات صالحة', 'warning');
           return;
        }

        Swal.fire({
          title: 'جاري الاستيراد...',
          text: `يتم الآن معالجة ${validData.length} طالب`,
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        try {
          await axiosInstance.post('/school-admin/students/bulk', { students: validData });
          fetchGradeDetails();
          Swal.fire('نجاح', `تم استيراد ${validData.length} طالب بنجاح`, 'success');
        } catch (err) {
          Swal.fire('خطأ', 'حدث خطأ أثناء حفظ البيانات الجماعية', 'error');
        }
      }
    });
  };

  const handleDeleteStudent = (student) => {
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: `سيتم حذف الطالب ${student.name} نهائياً!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then(async (res) => {
        if (res.isConfirmed) {
            try {
                await axiosInstance.delete(`/school-admin/students/${student.id}`);
                fetchGradeDetails();
                Swal.fire('تم الحذف', 'تم حذف الطالب من النظام', 'success');
            } catch (e) { Swal.fire('خطأ', 'فشل عملية الحذف', 'error'); }
        }
    });
  };

  // --- Section Actions ---
  const handleEditSection = (section) => {
    Swal.fire({
        title: 'تعديل بيانات الشعبة',
        html: `
          <div class="text-start mb-3">
            <label class="form-label small">اسم الشعبة</label>
            <input id="edit_sec_name" class="form-control" value="${section.name}">
          </div>
          <div class="text-start">
            <label class="form-label small">السعة القصوى</label>
            <input id="edit_sec_capacity" type="number" class="form-control" value="${section.capacity}">
          </div>
        `,
        showCancelButton: true, confirmButtonText: 'حفظ',
        preConfirm: () => ({
          name: document.getElementById('edit_sec_name').value,
          capacity: document.getElementById('edit_sec_capacity').value
        })
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await axiosInstance.put(`/school-admin/classes/${section.id}`, res.value);
            fetchGradeDetails();
          } catch (e) { Swal.fire('خطأ', 'فشل التعديل', 'error'); }
        }
      });
  };

  const handleDeleteSection = (section) => {
    Swal.fire({
        title: 'حذف شعبة؟',
        text: `سيتم حذف شعبة ${section.name}، تأكد من نقل الطلاب أولاً!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'حذف',
    }).then(async (res) => {
        if (res.isConfirmed) {
            try {
                await axiosInstance.delete(`/school-admin/classes/${section.id}`);
                fetchGradeDetails();
            } catch (e) { Swal.fire('خطأ', 'تحقق من خلو الشعبة من الطلاب قبل الحذف', 'error'); }
        }
    });
  };

  // --- Section Actions ---
  const handleAddSection = () => {
    Swal.fire({
      title: 'إضافة شعبة دراسية للصف',
      html: `
        <div class="text-start mb-3">
          <label class="form-label small">اسم الشعبة (مثال: أ أو 1)</label>
          <input id="sec_name" class="form-control" placeholder="أ">
        </div>
        <div class="text-start">
          <label class="form-label small">السعة القصوى</label>
          <input id="sec_capacity" type="number" class="form-control" value="30">
        </div>
      `,
      showCancelButton: true, confirmButtonText: 'إضافة',
      preConfirm: () => ({
        name: document.getElementById('sec_name').value,
        capacity: document.getElementById('sec_capacity').value,
        grade_level_id: selectedGrade.id
      })
    }).then(async (res) => {
      if (res.isConfirmed && res.value.name) {
        try {
          await axiosInstance.post('/school-admin/classes', res.value);
          fetchGradeDetails();
        } catch (e) { Swal.fire('خطأ', 'فشل إضافة الشعبة', 'error'); }
      }
    });
  };

  const handleAssignStudents = (section) => {
    Swal.fire({
        title: `تخصيص طلاب لشعبة ${section.name}`,
        html: `
            <div class="p-3 bg-light rounded small text-start">
                أدخل أرقام تسلسل الطلاب (مثلاً من 1 إلى 20) لتوزيعهم على هذه الشعبة من بين طلاب الصف.
            </div>
            <div class="row g-2 mt-3">
                <div class="col-6">
                    <input id="from_rank" type="number" class="form-control" placeholder="من (مثلاً 1)">
                </div>
                <div class="col-6">
                    <input id="to_rank" type="number" class="form-control" placeholder="إلى (مثلاً 20)">
                </div>
            </div>
        `,
        confirmButtonText: 'توزيع الطلاب',
        showCancelButton: true,
        preConfirm: () => ({
            from: document.getElementById('from_rank').value,
            to: document.getElementById('to_rank').value,
            section_id: section.id,
            grade_level_id: selectedGrade.id
        })
    }).then(async (res) => {
        if (res.isConfirmed) {
            try {
                await axiosInstance.post('/school-admin/assign-by-rank', res.value);
                fetchGradeDetails();
                Swal.fire('نجح التوزيع', 'تم تحديث شعب الطلاب بنجاح', 'success');
            } catch (e) { Swal.fire('خطأ', 'فشل التوزيع التلقائي', 'error'); }
        }
    });
  };

  const handleViewResources = async (subject) => {
    try {
        const term = (activeTab === 'term1') ? 1 : 2;
        const res = await axiosInstance.get(`/school-admin/content?subject_id=${subject.id}&term=${term}`);
        const files = res.data?.data || [];
        
        Swal.fire({
            title: `<div class="text-start px-3 pt-3">
                        <h4 class="fw-900 mb-1">مكتبة مقرر: ${subject.name}</h4>
                        <p class="text-muted small mb-0">يمكنك معاينة أو تحميل المراجع التعليمية المعتمدة</p>
                    </div>`,
            html: `
                <div class="p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-muted small fw-bold"><i class="fas fa-list me-1"></i> قائمة المصادر</span>
                        <button id="compare-btn" class="btn btn-primary rounded-pill px-3 btn-sm d-none">
                            <i class="fas fa-columns me-1"></i> معاينة متعددة (بجانب بعض)
                        </button>
                    </div>
                    ${files.length > 0 ? `
                        <div class="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm text-start bg-light">
                            ${files.map(f => `
                                <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-bottom border-light bg-white">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="form-check m-0">
                                            <input class="form-check-input file-select" type="checkbox" data-url="${axiosInstance.defaults.baseURL.replace('/api','')}${f.file_path}" data-title="${f.title}">
                                        </div>
                                        <div class="stat-icon-box ${f.file_path.endsWith('.pdf') ? 'bg-danger-soft text-danger' : (f.file_path.endsWith('.docx') || f.file_path.endsWith('.doc')) ? 'bg-primary-soft text-primary' : 'bg-success-soft text-success'} rounded-3" style="width:40px; height:40px;">
                                            <i class="fas ${f.file_path.endsWith('.pdf') ? 'fa-file-pdf' : (f.file_path.endsWith('.docx') || f.file_path.endsWith('.doc')) ? 'fa-file-word' : (f.file_path.endsWith('.pptx') || f.file_path.endsWith('.ppt')) ? 'fa-file-powerpoint' : 'fa-file'}"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark small">${f.title}</div>
                                            <div class="x-small text-muted">${f.type === 'book' ? 'كتاب مدرسي' : f.type === 'summary' ? 'ملخص' : 'مرجع إضافي'}</div>
                                        </div>
                                    </div>
                                    <button 
                                        data-url="${axiosInstance.defaults.baseURL.replace('/api','')}${f.file_path}"
                                        data-title="${f.title}"
                                        class="btn btn-sm btn-outline-primary rounded-pill px-3 preview-btn"
                                    >
                                        <i class="fas fa-eye me-1"></i> عرض
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-5 bg-light rounded-4 border-dashed">
                            <i class="fas fa-folder-open fa-3x text-muted opacity-20 mb-3"></i>
                            <p class="text-muted fw-bold">لا توجد ملفات مرفوعة لهذا المقرر حالياً</p>
                        </div>
                    `}
                </div>
            `,
            width: '650px',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'rounded-5 border-0 shadow-lg'
            },
            didOpen: () => {
                const container = Swal.getHtmlContainer();
                const compareBtn = container.querySelector('#compare-btn');
                const checkboxes = container.querySelectorAll('.file-select');
                
                const updateCompareBtn = () => {
                    const checked = container.querySelectorAll('.file-select:checked');
                    if (checked.length > 1 && checked.length <= 3) {
                        compareBtn.classList.remove('d-none');
                    } else {
                        compareBtn.classList.add('d-none');
                    }
                };

                checkboxes.forEach(cb => cb.addEventListener('change', updateCompareBtn));

                compareBtn.onclick = () => {
                    const checked = container.querySelectorAll('.file-select:checked');
                    const selectedFiles = Array.from(checked).map(cb => ({
                        url: cb.getAttribute('data-url'),
                        title: cb.getAttribute('data-title')
                    }));
                    handlePreviewMulti(selectedFiles);
                };

                const previewButtons = container.querySelectorAll('.preview-btn');
                previewButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const url = btn.getAttribute('data-url');
                        const title = btn.getAttribute('data-title');
                        handlePreviewFile(url, title);
                    });
                });
            }
        });
    } catch (e) {
        Swal.fire('خطأ', 'فشل جلب موارد المادة', 'error');
    }
  };

  const handlePreviewFile = async (url, title) => {
    const isDocx = url.toLowerCase().endsWith('.docx');
    const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isOfficeOther = url.toLowerCase().endsWith('.pptx') || url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.ppt');
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

    if (isImage) {
        let zoom = 1;
        Swal.fire({
            title: title,
            html: `
                <div class="overflow-auto bg-dark rounded-4 position-relative" style="height:80vh;">
                    <div class="position-absolute top-0 end-0 p-3 z-3 d-flex gap-2">
                        <button id="zoom-in" class="btn btn-light btn-sm shadow-sm"><i class="fas fa-search-plus"></i></button>
                        <button id="zoom-out" class="btn btn-light btn-sm shadow-sm"><i class="fas fa-search-minus"></i></button>
                        <button id="zoom-reset" class="btn btn-light btn-sm shadow-sm"><i class="fas fa-sync"></i></button>
                    </div>
                    <div class="d-flex align-items-center justify-content-center h-100 p-4">
                        <img id="preview-img" src="${url}" class="img-fluid transition-all" style="transform: scale(1); transform-origin: center; max-height:100%;">
                    </div>
                </div>
            `,
            width: '90%',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'rounded-5 border-0 shadow-lg p-0 overflow-hidden' },
            didOpen: () => {
                const img = document.getElementById('preview-img');
                document.getElementById('zoom-in').onclick = () => { zoom += 0.2; img.style.transform = `scale(${zoom})`; };
                document.getElementById('zoom-out').onclick = () => { if(zoom > 0.4) zoom -= 0.2; img.style.transform = `scale(${zoom})`; };
                document.getElementById('zoom-reset').onclick = () => { zoom = 1; img.style.transform = `scale(1)`; };
            }
        });
        return;
    }
    
    if (isDocx && isLocal) {
        // Professional Local DOCX Rendering
        Swal.fire({
            title: title,
            html: `
                <div id="docx-container" style="width:100%; height:80vh; overflow:auto; background:#f8f9fa; border-radius:15px; padding:20px; text-align:right; direction:rtl;">
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary mb-3"></div>
                        <p>جارٍ معالجة المستند للعرض المباشر...</p>
                    </div>
                </div>
            `,
            width: '90%',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'rounded-5 border-0 shadow-lg' },
            didOpen: async () => {
                try {
                    // Professional Offline Loading from local vendor
                    if (!window.JSZip) {
                        const script = document.createElement('script');
                        script.src = "/vendor/jszip.min.js";
                        await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                    }
                    if (!window.docx) {
                        const script = document.createElement('script');
                        script.src = "/vendor/docx-preview.min.js";
                        await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                    }

                    const response = await fetch(url, { mode: 'cors' });
                    if (!response.ok) throw new Error(`فشل تحميل الملف من الخادم (Status: ${response.status})`);
                    
                    const blob = await response.blob();
                    const container = document.getElementById('docx-container');
                    if (!container) return;
                    
                    container.innerHTML = ''; // Clear spinner
                    await window.docx.renderAsync(blob, container);
                } catch (e) {
                    console.error("Docx Preview Error:", e);
                    const container = document.getElementById('docx-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="alert alert-danger m-4 text-center">
                                <i class="fas fa-exclamation-circle fa-2x mb-2 d-block"></i>
                                <strong>تعذر عرض المستند:</strong><br/>
                                ${e.message}
                                <div class="mt-3 small text-muted">تأكد من أن الرابط متاح وأن المتصفح لا يحظر الطلب.</div>
                            </div>`;
                    }
                }
            }
        });
        return;
    }

    let previewUrl = url;
    if (isDocx || isOfficeOther) {
        if (isLocal && isOfficeOther) {
            Swal.fire({
                title: title,
                html: `<div class="text-center py-5">
                        <i class="fas fa-file-powerpoint fa-4x text-warning mb-3"></i>
                        <h5>العرض التقديمي يتطلب التحميل</h5>
                        <p class="text-muted small">ملفات PPTX تتطلب رابط إنترنت عام للمعاينة. يرجى تحميل الملف.</p>
                        <a href="${url}" download class="btn btn-primary rounded-pill px-4">تحميل الملف</a>
                       </div>`,
                showConfirmButton: false,
                showCloseButton: true
            });
            return;
        }
        previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    Swal.fire({
        title: title,
        html: `<iframe src="${previewUrl}" style="width:100%; height:80vh; border:none; border-radius:15px;" allowfullscreen></iframe>`,
        width: '90%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-5 border-0 shadow-lg'
        },
        footer: (isDocx || isOfficeOther) ? '<div class="text-muted x-small text-center w-100"><i class="fas fa-info-circle me-1"></i> يتم استخدام معاينة متطورة للملفات</div>' : null
    });
  };

  const handlePreviewMulti = (selectedFiles) => {
    Swal.fire({
        title: 'معاينة متعددة للمحتوى التعليمي',
        html: `
            <div class="row g-2 p-2">
                ${selectedFiles.map((f, idx) => {
                    const isDocx = f.url.toLowerCase().endsWith('.docx');
                    const isImage = f.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const isOfficeOther = f.url.toLowerCase().endsWith('.pptx') || f.url.toLowerCase().endsWith('.doc') || f.url.toLowerCase().endsWith('.ppt');
                    const isLocal = f.url.includes('localhost') || f.url.includes('127.0.0.1');
                    const previewUrl = (isDocx || isOfficeOther) ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(f.url)}` : f.url;
                    
                    return `
                    <div class="${selectedFiles.length === 3 ? 'col-md-4' : selectedFiles.length === 2 ? 'col-md-6' : 'col-md-12'}">
                        <div class="card border rounded-4 overflow-hidden h-100 shadow-sm position-relative">
                            <div class="p-2 bg-light border-bottom text-truncate small fw-bold text-start d-flex align-items-center gap-2">
                                <i class="fas ${f.url.endsWith('.pdf') ? 'fa-file-pdf text-danger' : (isDocx || isOfficeOther) ? 'fa-file-word text-primary' : isImage ? 'fa-image text-success' : 'fa-file'}"></i> 
                                <span class="text-truncate">${f.title}</span>
                            </div>
                            ${isImage ? `
                                <div class="position-absolute z-3 d-flex gap-1" style="top:45px; right:10px;">
                                    <button class="btn btn-white btn-xs shadow-sm multi-zoom-in" data-idx="${idx}"><i class="fas fa-plus"></i></button>
                                    <button class="btn btn-white btn-xs shadow-sm multi-zoom-out" data-idx="${idx}"><i class="fas fa-minus"></i></button>
                                </div>
                            ` : ''}
                            <div id="multi-preview-${idx}" class="multi-container" style="height:70vh; overflow:auto; background:#fff;">
                                ${isImage ? `
                                    <div class="d-flex align-items-center justify-content-center h-100 bg-dark p-2">
                                        <img id="multi-img-${idx}" src="${f.url}" class="img-fluid transition-all" style="transform: scale(1); max-height:100%;">
                                    </div>
                                ` : isOfficeOther && isLocal ? `
                                    <div class="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                                        <i class="fas fa-exclamation-circle text-warning fa-3x mb-3"></i>
                                        <div class="small fw-bold mb-2">المعاينة تتطلب رابط إنترنت</div>
                                        <a href="${f.url}" download class="btn btn-sm btn-light border rounded-pill">تحميل وفتح ${f.url.split('.').pop().toUpperCase()}</a>
                                    </div>
                                ` : `
                                    <iframe src="${previewUrl}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                                `}
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `,
        width: '98%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-5 border-0 shadow-lg'
        },
        didOpen: async () => {
            const container = Swal.getHtmlContainer();
            
            // Image Zooms
            const zooms = {};
            container.querySelectorAll('.multi-zoom-in').forEach(btn => {
                btn.onclick = () => {
                    const idx = btn.getAttribute('data-idx');
                    const img = document.getElementById(`multi-img-${idx}`);
                    zooms[idx] = (zooms[idx] || 1) + 0.2;
                    img.style.transform = `scale(${zooms[idx]})`;
                };
            });
            container.querySelectorAll('.multi-zoom-out').forEach(btn => {
                btn.onclick = () => {
                    const idx = btn.getAttribute('data-idx');
                    const img = document.getElementById(`multi-img-${idx}`);
                    zooms[idx] = Math.max(0.4, (zooms[idx] || 1) - 0.2);
                    img.style.transform = `scale(${zooms[idx]})`;
                };
            });

            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (!isLocal) return;

            // Load dependencies once
            if (!window.JSZip || !window.docx) {
                if (!window.JSZip) {
                    const s1 = document.createElement('script'); s1.src = "/vendor/jszip.min.js";
                    await new Promise(r => { s1.onload = r; document.head.appendChild(s1); });
                }
                if (!window.docx) {
                    const s2 = document.createElement('script'); s2.src = "/vendor/docx-preview.min.js";
                    await new Promise(r => { s2.onload = r; document.head.appendChild(s2); });
                }
            }

            // Render local docx
            selectedFiles.forEach(async (f, idx) => {
                if (f.url.toLowerCase().endsWith('.docx')) {
                    try {
                        const container = document.getElementById(`multi-preview-${idx}`);
                        container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm"></div></div>';
                        
                        const response = await fetch(f.url, { mode: 'cors' });
                        const blob = await response.blob();
                        
                        container.innerHTML = '';
                        container.style.padding = '15px';
                        await window.docx.renderAsync(blob, container);
                    } catch (e) {
                        console.error("Multi docx error", e);
                    }
                }
            });
        }
    });
  };

  if (!selectedGrade) {
    return (
      <div className="animate__animated animate__fadeIn">
        <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
          <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
            <div>
              <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>الصفوف والشعب</h2>
              <p className="mb-0 opacity-80 small">إدارة المراحل الدراسية وتوزيع الشعب وتنسيق المناهج</p>
            </div>
            <div className="avatar-lg bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
               <FontAwesomeIcon icon={faLayerGroup} size="xl" />
            </div>
          </div>
          <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
        </div>

        {loading ? <div className="text-center py-5"><div className="spinner-primary"></div></div> : (
          <div className="row g-3">
             {(grades || []).length > 0 ? grades.map(g => (
                <div className="col-md-4" key={g.id}>
                   <div className="card border-0 shadow-sm transition-up">
                      <div className="card-body p-4">
                         <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="stat-icon-box bg-primary bg-opacity-10 text-primary">
                               <FontAwesomeIcon icon={faLayerGroup} />
                            </div>
                            <div>
                               <h5 className="fw-900 mb-0">{g.name || 'صف غير مسمى'}</h5>
                               <span className="small text-muted">{(g.order_num) || '--'} الترتيب</span>
                            </div>
                         </div>
                         <button 
                            className="btn btn-primary w-100 py-3 rounded-4 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleManageGrade(g)}
                         >
                            <FontAwesomeIcon icon={faCogs} />
                            <span>إدارة الصف</span>
                         </button>
                      </div>
                   </div>
                </div>
             )) : (
                <div className="col-12 text-center py-5">
                    <div className="card border-0 shadow-sm p-5">
                        <FontAwesomeIcon icon={faLayerGroup} size="3x" className="mb-3 opacity-20" />
                        <h5>لا يوجد صفوف دراسية</h5>
                        <p className="text-muted">يجب تحديد الصفوف الدراسية للمدرسة من قبل الإدارة العليا أولاً</p>
                    </div>
                </div>
             )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden">
        <div className="position-relative z-1 d-flex align-items-center gap-3 text-end" style={{ direction: 'rtl' }}>
          <button className="btn btn-white btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 42, height: 42 }} onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowRight} className="text-primary" />
          </button>
          <div>
              <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>إدارة {selectedGrade.name}</h2>
              <p className="mb-0 opacity-80 small">تنسيق الطلاب والشعب وتوزيع المناهج الدراسية</p>
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      {/* Tabs Menu */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-2">
            <div className="nav nav-pills nav-fill gap-2 scrolling-tab">
                {[
                    { id: 'students', label: 'الطلاب', icon: faUserGraduate },
                    { id: 'sections', label: 'الشعب', icon: faChalkboard },
                    { id: 'term1', label: 'مقررات الترم الأول', icon: faBookOpen },
                    { id: 'term2', label: 'مقررات الترم الثاني', icon: faBookOpen },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-fill py-3 px-4 gap-2 d-flex align-items-center justify-content-center border-0 fw-bold transition-all rounded-3 ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-lg scale-up' 
                            : 'bg-white text-muted hover-light'
                        }`}
                        style={{ minWidth: '160px' }}
                    >
                        <FontAwesomeIcon icon={tab.icon} /> 
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-container animate-in">
        {subLoading ? <div className="text-center py-5"><div className="spinner-primary"></div></div> : (
          <>
            {activeTab === 'students' && (
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-900">سجل طلاب الصف</h6>
                        <div className="d-flex gap-2">
                             <button className="btn btn-success-soft btn-sm rounded-pill px-3 fw-bold" onClick={handleImportExcel}>
                                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> استيراد من إكسل
                             </button>
                             <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" onClick={handleAddStudent}>
                                <FontAwesomeIcon icon={faUserPlus} className="me-2" /> إضافة طالب
                             </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">الطالب</th>
                                    <th>الشعبة</th>
                                    <th>هاتف ولي الأمر</th>
                                    <th>سجل في</th>
                                    <th className="text-center pe-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map(s => (
                                    <tr key={s.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar bg-primary-soft text-primary">{s.name?.[0] || 'ط'}</div>
                                                <div>
                                                    <div className="fw-bold">{s.name}</div>
                                                    <div className="small text-muted">{s.student_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-info-subtle border border-info text-info rounded-pill">{s.class_name || 'بانتظار شعبة'}</span></td>
                                        <td>{s.parent_phone}</td>
                                        <td>{s.enrolled_at || '----'}</td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex justify-content-center gap-1">
                                                <button className="btn btn-xs btn-light text-primary" onClick={() => handleViewStudent(s)} title="معاينة"><FontAwesomeIcon icon={faEye} /></button>
                                                <button className="btn btn-xs btn-light text-warning" onClick={() => handleEditStudent(s)} title="تعديل"><FontAwesomeIcon icon={faEdit} /></button>
                                                <button className="btn btn-xs btn-light text-danger" onClick={() => handleDeleteStudent(s)} title="حذف"><FontAwesomeIcon icon={faTrash} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">لا يوجد طلاب مسجلين حالياً في هذا الصف</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'sections' && (
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card h-100 border-0 shadow-sm text-center p-4 border-dashed" onClick={handleAddSection} style={{ cursor: 'pointer', border: '2px dashed var(--border-color) !important' }}>
                           <div className="stat-icon-box mx-auto mb-3 bg-success bg-opacity-10 text-success">
                              <FontAwesomeIcon icon={faPlus} />
                           </div>
                           <h6 className="fw-900">إضافة شعبة جديدة</h6>
                           <p className="small text-muted mb-0">تقسيم الصف إلى مجموعات</p>
                        </div>
                    </div>
                    {sections.map(sec => (
                        <div className="col-md-3" key={sec.id}>
                            <div className="card border-0 shadow-sm h-100 p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="badge bg-primary rounded-pill px-3">شعبة {sec.name}</div>
                                    <div className="d-flex gap-1">
                                        <button className="btn btn-icon btn-xs btn-light" onClick={() => handleEditSection(sec)}><FontAwesomeIcon icon={faEdit} /></button>
                                        <button className="btn btn-icon btn-xs btn-light text-danger" onClick={() => handleDeleteSection(sec)}><FontAwesomeIcon icon={faTrash} /></button>
                                    </div>
                                </div>
                                <h3 className="fw-900 mb-1">{sec.student_count || 0}</h3>
                                <p className="text-muted small mb-3">طالب مسجل (السعة: {sec.capacity})</p>
                                <button className="btn btn-outline-primary btn-sm w-100 rounded-3" onClick={() => handleAssignStudents(sec)}>
                                    توزيع الطلاب يدوياً
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab.startsWith('term') && (
                <div className="row g-4 animate-in">
                    {subjects.length > 0 ? subjects.map(sub => (
                        <div className="col-xl-4 col-md-6" key={sub.id}>
                            <div className="card shadow-sm border-0 rounded-4 overflow-hidden transition-up">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyIn: 'center' }}>
                                            <FontAwesomeIcon icon={faBook} size="lg" />
                                        </div>
                                        <div>
                                            <h5 className="fw-900 mb-0 text-dark">{sub.name}</h5>
                                            <p className="text-muted x-small mb-0">المستوى الأكاديمي: {selectedGrade.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="divider my-3 opacity-10"></div>
                                    
                                    <div className="d-flex flex-column gap-2">
                                        <button 
                                            className="btn btn-indigo w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-none" 
                                            onClick={() => handleViewResources(sub)}
                                        >
                                            <FontAwesomeIcon icon={faFolderOpen} />
                                            <span>استعراض مكتبة المقرر</span>
                                        </button>
                                        
                                        <div className="d-grid gap-2">
                                            <button 
                                                className="btn btn-light-primary btn-sm rounded-3 py-2 fw-bold" 
                                                onClick={() => Swal.fire('قريباً', 'سيتم تفعيل ميزة توزيع المعلمين في التحديث القادم', 'info')}
                                            >
                                                <FontAwesomeIcon icon={faChalkboard} className="me-2" />
                                                تعيين المدرس
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-light border-0 py-2 text-center x-small text-muted">
                                    <FontAwesomeIcon icon={faTag} className="me-1" />
                                    مادة موحدة مركزياً
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center py-5">
                            <div className="card border-0 shadow-sm p-5 border-dashed rounded-5">
                                <div className="mb-3 opacity-10">
                                    <FontAwesomeIcon icon={faBook} size="4x" />
                                </div>
                                <h4 className="fw-900">لا توجد خطة دراسية</h4>
                                <p className="text-muted mb-0">لم يتم إضافة مواد لهذا الصف في النظام بعد</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default ManageSchoolStructure;
