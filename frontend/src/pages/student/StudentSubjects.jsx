import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, faChevronRight, faFilePdf, faPlayCircle, 
  faFileArchive, faLightbulb, faDownload, faSearch,
  faArrowLeft, faGraduationCap, faEye, faLink, faFileWord, faFilePowerpoint, faColumns, faList, faFolderOpen, faPlus, faMinus
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeTerm, setActiveTerm] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]); // For Multi-Preview

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/student/subjects');
      setSubjects(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setSelectedFiles([]);
    setContentLoading(true);
    try {
      const res = await axiosInstance.get(`/student/subjects/${subject.id}/content?term=${activeTerm}`);
      setContent(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setContentLoading(false); }
  };

  // Multiple Selection logic
  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => {
        if (prev.find(f => f.id === file.id)) {
            return prev.filter(f => f.id !== file.id);
        }
        if (prev.length >= 3) {
            Swal.fire('تنبيه', 'يمكنك مقارنة 3 ملفات بحد أقصى', 'warning');
            return prev;
        }
        return [...prev, file];
    });
  };

  const getBaseUrl = () => {
    return axiosInstance.defaults.baseURL.replace('/api', '');
  };

  const handleFilePreview = (url, title) => {
    const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
    const isImage = fullUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isDocx = fullUrl.toLowerCase().endsWith('.docx');
    const isOfficeOther = fullUrl.toLowerCase().endsWith('.pptx') || fullUrl.toLowerCase().endsWith('.doc') || fullUrl.toLowerCase().endsWith('.ppt');
    const isLocal = fullUrl.includes('localhost') || fullUrl.includes('127.0.0.1');

    if (isDocx && !isOfficeOther) {
        Swal.fire({
            title: title,
            html: `<div id="docx-container" style="width:100%; height:80vh; overflow:auto; background:#f8f9fa; border-radius:15px; padding:20px; text-align:right; direction:rtl;"><div class="text-center py-5"><div class="spinner-border text-primary mb-3"></div><p>جارٍ معالجة المستند...</p></div></div>`,
            width: '90%', showConfirmButton: false, showCloseButton: true,
            customClass: { popup: 'rounded-5 border-0 shadow-lg' },
            didOpen: async () => {
                try {
                    if (!window.JSZip) {
                        const script = document.createElement('script'); script.src = "/vendor/jszip.min.js";
                        await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                    }
                    if (!window.docx) {
                        const script = document.createElement('script'); script.src = "/vendor/docx-preview.min.js";
                        await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                    }
                    const response = await fetch(fullUrl, { mode: 'cors' });
                    const blob = await response.blob();
                    const container = document.getElementById('docx-container');
                    if (container) { container.innerHTML = ''; await window.docx.renderAsync(blob, container); }
                } catch (e) {
                    console.error(e);
                    document.getElementById('docx-container').innerHTML = `<div class="alert alert-danger m-4">تعذر عرض الملف</div>`;
                }
            }
        });
        return;
    }

    if (isImage) {
        let zoom = 1;
        Swal.fire({
            title: title,
            html: `
                <div class="overflow-auto bg-dark rounded-4 position-relative" style="height:80vh;">
                    <div class="position-absolute top-0 end-0 p-3 z-3 d-flex gap-2">
                        <button id="zoom-in" class="btn btn-light btn-sm shadow-sm"><i class="fas fa-plus"></i></button>
                        <button id="zoom-out" class="btn btn-light btn-sm shadow-sm"><i class="fas fa-minus"></i></button>
                    </div>
                    <div class="d-flex align-items-center justify-content-center h-100 p-4">
                        <img id="preview-img" src="${fullUrl}" class="img-fluid transition-all" style="transform: scale(1); max-height:100%;">
                    </div>
                </div>
            `,
            width: '90%', showConfirmButton: false, showCloseButton: true,
            customClass: { popup: 'rounded-5 border-0 shadow-lg p-0 overflow-hidden' },
            didOpen: () => {
                const img = document.getElementById('preview-img');
                document.getElementById('zoom-in').onclick = () => { zoom += 0.2; img.style.transform = `scale(${zoom})`; };
                document.getElementById('zoom-out').onclick = () => { if(zoom > 0.4) zoom -= 0.2; img.style.transform = `scale(${zoom})`; };
            }
        });
        return;
    }

    let previewUrl = fullUrl;
    if (isDocx || isOfficeOther) {
        if (isLocal && isOfficeOther) {
            Swal.fire({
                title: title,
                html: `<div class="text-center py-5"><h5>المعاينة تتطلب رابط إنترنت</h5><p>يرجى تحميل الملف لمعاينته.</p><a href="${fullUrl}" download class="btn btn-primary rounded-pill px-4">تحميل الملف</a></div>`,
                showConfirmButton: false, showCloseButton: true
            });
            return;
        }
        previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    }

    Swal.fire({
        title: title,
        html: `<iframe src="${previewUrl}" style="width:100%; height:80vh; border:none; border-radius:15px;" allowfullscreen></iframe>`,
        width: '90%', showCloseButton: true, showConfirmButton: false,
        customClass: { popup: 'rounded-5 border-0 shadow-lg' }
    });
  };

  const handlePreviewMulti = () => {
    if (selectedFiles.length < 2) return;
    Swal.fire({
        title: 'معاينة ومقارنة المراجع',
        html: `
            <div class="row g-2 p-2">
                ${selectedFiles.map((f, idx) => {
                    const fullUrl = f.file_path.startsWith('http') ? f.file_path : `${getBaseUrl()}${f.file_path}`;
                    const isDocx = fullUrl.toLowerCase().endsWith('.docx');
                    return `
                    <div class="${selectedFiles.length === 2 ? 'col-md-6' : 'col-md-4'}">
                        <div class="card border rounded-4 overflow-hidden h-100 shadow-sm">
                            <div class="p-2 bg-light border-bottom small fw-bold text-end truncate" style="direction:rtl;">${f.title}</div>
                            <div id="multi-container-${idx}" style="height:70vh; overflow:auto; background:#fff;">
                                ${isDocx ? `
                                    <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
                                ` : `
                                    <iframe src="${fullUrl}" style="width:100%; height:100%; border:none;"></iframe>
                                `}
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `,
        width: '98%', showCloseButton: true, showConfirmButton: false,
        didOpen: async () => {
            for (let i = 0; i < selectedFiles.length; i++) {
                const f = selectedFiles[i];
                const fullUrl = f.file_path.startsWith('http') ? f.file_path : `${getBaseUrl()}${f.file_path}`;
                if (fullUrl.toLowerCase().endsWith('.docx')) {
                    try {
                        if (!window.JSZip) {
                            const script = document.createElement('script'); script.src = "/vendor/jszip.min.js";
                            await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                        }
                        if (!window.docx) {
                            const script = document.createElement('script'); script.src = "/vendor/docx-preview.min.js";
                            await new Promise(r => { script.onload = r; document.head.appendChild(script); });
                        }
                        const response = await fetch(fullUrl, { mode: 'cors' });
                        const blob = await response.blob();
                        const container = document.getElementById(`multi-container-${i}`);
                        if (container) {
                            container.innerHTML = '';
                            await window.docx.renderAsync(blob, container);
                        }
                    } catch (e) { console.error(e); }
                }
            }
        }
    });
  };

  // Group content by type
  const groupedContent = content.reduce((acc, item) => {
    const type = item.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const getTypeName = (type) => {
    const types = { curriculum: 'المقرر الدراسي', summary: 'ملخصات ومذكرات', book: 'الكتب والكتب التفاعلية', video: 'شروحات مرئية', reference: 'نماذج اختبارات ومراجع', other: 'ملفات إضافية' };
    return types[type] || 'أخرى';
  };

  if (selectedSubject) {
    return (
      <div className="animate-in">
        <div className="d-flex align-items-center justify-content-between mb-4">
           <div className="d-flex align-items-center gap-3">
              <button className="btn btn-white shadow-sm rounded-circle" onClick={() => setSelectedSubject(null)} style={{ width: 40, height: 40 }}>
                 <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div>
                 <h4 className="fw-900 mb-0 font-cairo">{selectedSubject.name}</h4>
                 <p className="text-muted small mb-0">المستوى: {activeTerm === 1 ? 'الترم الأول' : 'الترم الثاني'}</p>
              </div>
           </div>
           {selectedFiles.length >= 2 && (
             <button className="btn btn-primary rounded-pill px-4 shadow-sm animate__animated animate__bounceIn" onClick={handlePreviewMulti}>
                <FontAwesomeIcon icon={faColumns} className="me-2" /> مقارنة ({selectedFiles.length}) ملفات
             </button>
           )}
        </div>

        <div className="row g-4">
           <div className="col-lg-12">
              {contentLoading ? (
                 <div className="p-5 text-center card border-0 shadow-sm rounded-4"><div className="spinner-primary mx-auto"></div></div>
              ) : Object.keys(groupedContent).length > 0 ? (
                 Object.keys(groupedContent).map(type => (
                    <div key={type} className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 transition-hover">
                       <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
                          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 font-cairo">
                             <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                <FontAwesomeIcon icon={faFolderOpen} size="xs" />
                             </div>
                             {getTypeName(type)}
                          </h6>
                          <span className="badge bg-light text-muted rounded-pill">{groupedContent[type].length} ملف</span>
                       </div>
                       <div className="card-body p-0">
                          <div className="list-group list-group-flush">
                            {groupedContent[type].map(item => (
                                <div key={item.id} className="list-group-item d-flex align-items-center justify-content-between py-3 border-light bg-white transition-all text-end" style={{ direction: 'rtl' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="form-check m-0">
                                            <input 
                                                className="form-check-input file-select cursor-pointer shadow-none" 
                                                type="checkbox" 
                                                checked={!!selectedFiles.find(f => f.id === item.id)}
                                                onChange={() => toggleFileSelection(item)}
                                            />
                                        </div>
                                        <div className="bg-light text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                            <FontAwesomeIcon icon={item.file_path.endsWith('.pdf') ? faFilePdf : faFilePowerpoint} />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark small font-cairo">{item.title}</div>
                                            <div className="x-small text-muted">{item.file_size ? (item.file_size / 1024 / 1024).toFixed(2) + ' MB' : '---'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-white btn-sm rounded-pill px-3 shadow-none border text-primary font-cairo"
                                            onClick={() => handleFilePreview(item.file_path, item.title)}
                                        >
                                            <FontAwesomeIcon icon={faEye} /> معاينة
                                        </button>
                                        <a href={item.file_path} download className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                            <FontAwesomeIcon icon={faDownload} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                          </div>
                       </div>
                    </div>
                 ))
              ) : (
                <div className="card border-0 shadow-sm p-5 text-center mt-4 rounded-4 border-dashed">
                   <FontAwesomeIcon icon={faBook} size="3x" className="mb-3 opacity-10" />
                   <h5 className="text-muted font-cairo">لا توجد ملفات مرفوعة لهذا المقرر حالياً.</h5>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
       <div className="page-hero mb-4 p-4 rounded-4 shadow-sm bg-primary text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-end" style={{ direction: 'rtl' }}>
          <div>
            <h2 className="fw-900 mb-1" style={{ fontFamily: 'Cairo' }}>موادي الدراسية</h2>
            <p className="mb-0 opacity-80 small font-cairo">استكشف الكتب والمصادر التعليمية الخاصة بفصلك</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
             <FontAwesomeIcon icon={faGraduationCap} size="xl" />
          </div>
        </div>
        <div className="position-absolute start-0 top-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-50%)' }}></div>
      </div>

      <div className="d-flex gap-2 mb-4 p-1 bg-light rounded-pill mx-auto shadow-sm" style={{ width: 'fit-content' }}>
           <button 
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${activeTerm === 1 ? 'btn-primary shadow-sm' : 'btn-transparent text-muted'}`}
              onClick={() => setActiveTerm(1)}
           >
              الترم الأول
           </button>
           <button 
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${activeTerm === 2 ? 'btn-primary shadow-sm' : 'btn-transparent text-muted'}`}
              onClick={() => setActiveTerm(2)}
           >
              الترم الثاني
           </button>
      </div>

      {loading ? (
         <div className="row g-4"><div className="text-center py-5 w-100"><div className="spinner-primary mx-auto"></div></div></div>
      ) : subjects.length > 0 ? (
        <div className="row g-4 text-end" style={{ direction: 'rtl' }}>
          {subjects.map(s => (
            <div key={s.id} className="col-md-4">
              <div 
                className="card border-0 shadow-sm transition-up cursor-pointer overflow-hidden h-100" 
                style={{ borderRadius: '20px' }}
                onClick={() => handleSelectSubject(s)}
              >
                <div className="p-4 position-relative">
                   <div className={`avatar mb-3 rounded-4 shadow-sm text-white d-flex align-items-center justify-content-center`} style={{ width: 50, height: 50, backgroundColor: s.color || '#6366f1' }}>
                      <FontAwesomeIcon icon={faBook} size="lg" />
                   </div>
                   <h5 className="fw-900 mb-1 font-cairo">{s.name}</h5>
                   <p className="text-muted small mb-3">استعرض المقررات والملخصات</p>
                   <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                      <span className="x-small fw-bold text-primary">فتح المادة</span>
                      <FontAwesomeIcon icon={faChevronRight} className="text-muted x-small" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-5 text-center mt-4" style={{ borderRadius: '24px' }}>
           <FontAwesomeIcon icon={faBook} size="3x" className="mb-3 opacity-10" />
           <h5 className="text-muted font-cairo">لا توجد مواد مسجلة حالياً.</h5>
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;
