import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCogs, faServer, faDatabase, faEnvelope, faGlobe, faHistory,
  faShieldAlt, faSave, faClock, faMicrochip, faToolbox, faCheckCircle,
  faSyncAlt, faLock, faUserShield, faKey, faCloud, faDownload, faUndo,
  faExclamationTriangle, faBan, faUser, faTrash
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [logs, setLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
   
   // Security Settings State
   const [securitySettings, setSecuritySettings] = useState({
     password_min_length: '8',
     password_require_special: '1',
     session_timeout: '120',
     max_login_attempts: '5',
     enable_2fa: '0'
   });

   useEffect(() => {
     fetchSettings();
   }, []);

   const fetchSettings = async () => {
     try {
       const res = await axiosInstance.get('/super-admin/settings');
       if (res.data?.data) {
         setSecuritySettings(prev => ({ ...prev, ...res.data.data }));
       }
     } catch (e) { console.error('Failed to fetch settings', e); }
   };

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'backup') fetchBackups();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/logs?per_page=20');
      setLogs(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/backups');
      setBackups(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      await axiosInstance.post('/super-admin/backups');
      Swal.fire({ title: 'تمت العملية', text: 'تم إنشاء نسخة احتياطية جديدة بنجاح', icon: 'success', timer: 2000, showConfirmButton: false });
      fetchBackups();
    } catch (e) {
      Swal.fire({ title: 'خطأ', text: e.response?.data?.message || 'فشل إنشاء النسخة الاحتياطية. يرجى التحقق من صلاحيات الخادم أو المسار.', icon: 'error' });
    } finally { setBackupLoading(false); }
  };

  const handleDeleteBackup = (filename) => {
    Swal.fire({
      title: 'حذف النسخة الاحتياطية؟',
      text: 'ستفقد هذا الملف للأبد، هل أنت متأكد؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/super-admin/backups?filename=${filename}`);
          Swal.fire({ title: 'تم الحذف بنجاح', icon: 'success', timer: 1500, showConfirmButton: false });
          fetchBackups();
        } catch (e) {
          Swal.fire({ title: 'خطأ', text: 'تعذر حذف النسخة الاحتياطية', icon: 'error' });
        }
      }
    });
  };

  const handleRestoreBackup = (filename) => {
    Swal.fire({
      title: 'استعادة قاعدة البيانات؟',
      text: 'ستقوم هذه العملية باستبدال البيانات الحالية ببيانات النسخة المختارة. هل أنت متأكد؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'نعم، استعد الآن',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setBackupLoading(true);
        try {
          await axiosInstance.put(`/super-admin/backups?filename=${filename}`);
          Swal.fire({ title: 'تمت الاستعادة بنجاح', text: 'تمت مراجعة قاعدة البيانات وتحديثها بنجاح', icon: 'success' });
        } catch (e) {
          Swal.fire({ title: 'خطأ', text: e.response?.data?.message || 'فشل استعادة النسخة', icon: 'error' });
        } finally { setBackupLoading(false); }
      }
    });
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const response = await axiosInstance.get(`/super-admin/backups?filename=${filename}&download=1`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      Swal.fire({ title: 'خطأ', text: 'تعذر تحميل الملف', icon: 'error' });
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/super-admin/settings', securitySettings);
      Swal.fire({
        title: 'تم الحفظ',
        text: 'تم تحديث إعدادات الأمان بنجاح',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'فشل حفظ الإعدادات';
      Swal.fire({ title: 'خطأ', text: errorMsg, icon: 'error' });
    } finally { setLoading(false); }
  };

  const handleSettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة البنية التحتية</div>
          <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>إعدادات النظام الأساسية</h2>
          <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0 }}>تكوين الخوادم، قواعد البيانات، والبريد الإلكتروني</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body p-2">
              {[
                { id: 'general', label: 'الإعدادات العامة', icon: faCogs },
                { id: 'security', label: 'الأمان والخصوصية', icon: faShieldAlt },
                { id: 'email', label: 'خادم البريد (SMTP)', icon: faEnvelope },
                { id: 'backup', label: 'النسخ الاحتياطي', icon: faDatabase },
                { id: 'logs', label: 'سجلات النظام', icon: faHistory },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`btn w-100 text-start d-flex align-items-center gap-3 py-3 mb-1 border-0 ${activeTab === item.id ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                  style={{ borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-9 animate-in">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent py-4 px-4 border-bottom border-opacity-10">
              <h5 className="mb-0 fw-bold">
                {activeTab === 'general' && 'تكوين النظام العام'}
                {activeTab === 'security' && 'سياسات الأمان والخصوصية'}
                {activeTab === 'email' && 'إعدادات البريد الإلكتروني (SMTP)'}
                {activeTab === 'backup' && 'إدارة قواعد البيانات والنسخ السحابي'}
                {activeTab === 'logs' && 'سجلات النظام (System Logs)'}
              </h5>
            </div>
            <div className="card-body p-4">
               {activeTab === 'general' && (
                 <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label">اسم النظام</label>
                      <input type="text" className="form-control" defaultValue="المدارس الذكية - Smart Schools" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">رابط الموقع (Base URL)</label>
                      <input type="url" className="form-control" defaultValue="https://smart-school.edu" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">المنطقة الزمنية</label>
                       <select className="form-select">
                          <option>Asia/Riyadh (GMT+3)</option>
                          <option>Asia/Aden (GMT+3)</option>
                          <option>UTC</option>
                       </select>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">اللغة الافتراضية</label>
                       <select className="form-select">
                          <option>العربية (Arabic)</option>
                          <option>الإنجليزية (English)</option>
                       </select>
                    </div>
                 </div>
               )}

               {activeTab === 'security' && (
                 <div className="row g-4 animate-in">
                    <div className="col-md-6">
                       <label className="form-label d-flex justify-content-between">
                          <span>سياسة كلمات المرور</span>
                          <span className="badge bg-success bg-opacity-10 text-success">قوي</span>
                       </label>
                       <select 
                         className="form-select" 
                         value={securitySettings.password_min_length}
                         onChange={(e) => handleSettingChange('password_min_length', e.target.value)}
                       >
                          <option value="6">طول أدنى 6 رموز</option>
                          <option value="8">طول أدنى 8 رموز</option>
                          <option value="10">طول أدنى 10 رموز</option>
                       </select>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">التحقق بخطوتين (2FA)</label>
                        <div className="form-check form-switch mt-2">
                           <input 
                             className="form-check-input" 
                             type="checkbox" 
                             checked={securitySettings.enable_2fa === '1'}
                             onChange={(e) => handleSettingChange('enable_2fa', e.target.checked ? '1' : '0')}
                           />
                           <label className="form-check-label text-muted small">إلزام جميع المدراء باستخدام رمز OTP</label>
                        </div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">مدة انتهاء الجلسة (Session)</label>
                        <div className="input-group">
                           <input 
                             type="number" 
                             className="form-control" 
                             value={securitySettings.session_timeout}
                             onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                           />
                           <span className="input-group-text">دقيقة</span>
                        </div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">محاولات تسجيل الدخول الفاشلة</label>
                       <div className="input-group">
                          <input 
                            type="number" 
                            className="form-control" 
                            value={securitySettings.max_login_attempts}
                            onChange={(e) => handleSettingChange('max_login_attempts', e.target.value)}
                          />
                          <span className="input-group-text">محاولات</span>
                       </div>
                    </div>
                    <div className="col-12 mt-3 text-center">
                       <div className="p-4 bg-light rounded-4 border border-dashed">
                          <FontAwesomeIcon icon={faShieldAlt} size="2x" className="mb-2 text-success opacity-50" />
                          <div className="fw-bold">نظام التشفير والاتصال الآمن (SSL/TLS)</div>
                          <div className="small text-muted mb-0">جميع الاتصالات عبر النظام محمية بتشفير 256-bit ونظام HTTPS نشط بالكامل.</div>
                       </div>
                    </div>
                    <div className="col-12 mt-4">
                        <button className="btn btn-primary px-5 py-3 rounded-3 shadow-sm fw-bold" onClick={handleSaveSecurity} disabled={loading}>
                           {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                           حفظ كافة التغييرات في سياسات الأمان
                        </button>
                     </div>
                 </div>
               )}

               {activeTab === 'email' && (
                 <div className="row g-4">
                    <div className="col-12 p-3 bg-info bg-opacity-10 text-info rounded-3 small mb-2">
                       يُستخدم هذا الخادم لإرسال إشعارات الطلاب، تقارير أولياء الأمور، وطلبات استعادة كلمة المرور.
                    </div>
                    <div className="col-md-8">
                       <label className="form-label">SMTP Host</label>
                       <input type="text" className="form-control" placeholder="smtp.gmail.com" dir="ltr" />
                    </div>
                    <div className="col-md-4">
                       <label className="form-label">Port</label>
                       <input type="text" className="form-control" placeholder="587" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">Username</label>
                       <input type="text" className="form-control" placeholder="admin@domain.com" dir="ltr" />
                    </div>
                    <div className="col-md-6">
                       <label className="form-label">Password</label>
                       <input type="password" password="true" className="form-control" placeholder="••••••••" dir="ltr" />
                    </div>
                 </div>
               )}

               {activeTab === 'backup' && (
                  <div className="animate-in">
                     <div className="row g-4 mb-4">
                        <div className="col-md-4">
                           <div className="card h-100 bg-light border-0 text-center p-3">
                              <FontAwesomeIcon icon={faDatabase} size="2x" className="mb-2 text-primary opacity-50" />
                              <div className="fw-bold small mb-2">جدولة النسخ التلقائي</div>
                              <select className="form-select form-select-sm border-0 shadow-sm">
                                 <option>يومياً (3 ص)</option>
                                 <option>أسبوعياً (الجمعة)</option>
                                 <option>يدوي فقط</option>
                              </select>
                           </div>
                        </div>
                        <div className="col-md-4">
                           <div className="card h-100 bg-light border-0 text-center p-3">
                              <FontAwesomeIcon icon={faCloud} size="2x" className="mb-2 text-info opacity-50" />
                              <div className="fw-bold small mb-2">وجهة التخزين</div>
                              <select className="form-select form-select-sm border-0 shadow-sm">
                                 <option>خادم محلي (Local)</option>
                                 <option>Amazon S3</option>
                                 <option>Google Drive</option>
                              </select>
                           </div>
                        </div>
                        <div className="col-md-4">
                           <div className="card h-100 bg-light border-0 text-center p-3">
                              <div className="fw-bold mb-1 small text-primary">إجمالي النسخ</div>
                              <div className="h4 fw-900 mb-0">{backups.length} <small>نسخة</small></div>
                              <div className="mt-2 text-success small">
                                 {backups.length > 0 ? (
                                    <><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> آخرها: {backups[0].created_at.split(' ')[0]}</>
                                 ) : 'لا يوجد نسخ'}
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="d-flex gap-2 mb-4">
                        <button 
                           className="btn btn-primary flex-fill py-3 rounded-3 shadow-none fw-bold" 
                           onClick={handleCreateBackup}
                           disabled={backupLoading}
                        >
                           {backupLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <FontAwesomeIcon icon={faSyncAlt} className="me-2" />}
                           بدء إنشاء نسخة احتياطية للقاعدة الآن
                        </button>
                     </div>

                     <div className="table-responsive bg-light rounded-4 border overflow-hidden">
                        <table className="table table-sm table-hover align-middle mb-0">
                           <thead className="bg-white">
                              <tr className="small text-muted">
                                 <th className="ps-3 py-3">الملف</th>
                                 <th>الحجم</th>
                                 <th>التاريخ</th>
                                 <th className="text-center pe-3">إجراء</th>
                              </tr>
                           </thead>
                           <tbody className="small">
                              {loading ? <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr> :
                               backups.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">لم يتم العثور على أي نسخ احتياطية</td></tr> :
                               backups.map((b, i) => (
                                 <tr key={i}>
                                    <td className="ps-3 py-3 fw-bold text-primary">{b.filename}</td>
                                    <td>{(b.size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td>{b.created_at}</td>
                                    <td className="text-center pe-3">
                                       <div className="d-flex justify-content-center gap-1">
                                          <button className="btn btn-sm btn-light text-primary" onClick={() => handleDownloadBackup(b.filename)} title="تحميل"><FontAwesomeIcon icon={faDownload} /></button>
                                          <button className="btn btn-sm btn-light text-success" onClick={() => handleRestoreBackup(b.filename)} title="استعادة"><FontAwesomeIcon icon={faUndo} /></button>
                                          <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteBackup(b.filename)} title="حذف"><FontAwesomeIcon icon={faTrash} /></button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {activeTab === 'logs' && (
                  <div className="animate-in">
                     <div className="table-responsive bg-light rounded-4 border overflow-hidden">
                        <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                           <thead className="bg-white">
                              <tr className="text-muted">
                                 <th className="ps-3 py-3">المستخدم</th>
                                 <th>الإجراء (Action)</th>
                                 <th>الجدول</th>
                                 <th>الوقت</th>
                                 <th>عنوان IP</th>
                              </tr>
                           </thead>
                           <tbody>
                              {loading ? <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr> :
                               logs.length === 0 ? <tr><td colSpan="5" className="text-center py-5 text-muted">لا توجد سجلات حالياً</td></tr> :
                               logs.map((log) => (
                                 <tr key={log.id}>
                                    <td className="ps-3 py-3">
                                       <div className="d-flex align-items-center gap-2">
                                          <div className="avatar-xs bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 30, height: 30 }}>
                                             <FontAwesomeIcon icon={faUser} size="xs" />
                                          </div>
                                          <div>
                                             <div className="fw-bold">{log.user_name || 'System'}</div>
                                             <div className="x-small text-muted">{log.user_role || 'Auto'}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td><span className="badge bg-info bg-opacity-10 text-info">{log.action}</span></td>
                                    <td><code>{log.table_name || '--'}</code></td>
                                    <td className="text-muted small">{log.created_at}</td>
                                    <td className="text-muted small" dir="ltr">{log.ip_address}</td>
                                 </tr>
                               ))
                              }
                           </tbody>
                        </table>
                     </div>
                     <div className="mt-3 text-center">
                        <button className="btn btn-link btn-sm text-decoration-none" onClick={fetchLogs}>
                           <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> تحديث السجلات
                        </button>
                     </div>
                  </div>
               )}

               <div className="divider mt-5"></div>
               <div className="d-flex justify-content-end">
                  <button className="btn btn-primary px-5 py-3" onClick={handleSaveSecurity}>
                     <FontAwesomeIcon icon={faSave} className="me-2" /> حفظ كافة التغييرات
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
