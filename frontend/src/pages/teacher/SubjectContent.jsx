import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, faFilePdf, faPlayCircle, faDownload, 
  faSearch, faFilter, faLayerGroup, faChalkboard
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';

const SubjectContent = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axiosInstance.get('/content/materials');
        setMaterials(res.data?.data || [
           { id: 1, title: 'كتاب الرياضيات - الجزء الأول', type: 'pdf', size: '12 MB', category: 'المنهج الدراسي' },
           { id: 2, title: 'شرح المصفوفات والعمليات عليها', type: 'video', duration: '15:20', category: 'ملخصات' },
           { id: 3, title: 'ملخص الوحدة الثالثة: التفاضل', type: 'pdf', size: '2 MB', category: 'ملخصات' },
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
         <div className="d-flex justify-content-between align-items-center">
            <div>
               <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>المكتبة التعليمية الرقمية</h2>
               <p className="mb-0 opacity-80 small">المنهج الدراسي، الملخصات المعتمدة، والمصادر الإثرائية</p>
            </div>
            <div className="d-flex gap-2">
               <select className="form-select border-0 shadow-sm" value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
                  <option value="all">جميع الأنواع</option>
                  <option value="pdf">ملفات PDF</option>
                  <option value="video">فيديوهات</option>
               </select>
            </div>
         </div>
      </div>

      <div className="row g-4 mb-4">
         <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-primary text-white" style={{ borderRadius: '24px' }}>
               <div className="d-flex justify-content-between mb-3">
                  <div className="stat-icon-box bg-white bg-opacity-20 text-white">
                     <FontAwesomeIcon icon={faChalkboard} />
                  </div>
               </div>
               <h6 className="fw-bold mb-1">المقرر الأساسي</h6>
               <p className="x-small opacity-80 mb-0">جميع الكتب المدرسية المعتمدة رسمياً لهذا العام</p>
            </div>
         </div>
         <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-success text-white" style={{ borderRadius: '24px' }}>
               <div className="d-flex justify-content-between mb-3">
                  <div className="stat-icon-box bg-white bg-opacity-20 text-white">
                     <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
               </div>
               <h6 className="fw-bold mb-1">الملخصات والمراجع</h6>
               <p className="x-small opacity-80 mb-0">محتوى إضافي لمساعدتك في المذاكرة والتحصيل</p>
            </div>
         </div>
      </div>

      {loading ? (
         <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="row g-3 animate-in">
           {materials.map(m => (
              <div className="col-md-6" key={m.id}>
                 <div className="card shadow-sm border-0 transition-hover">
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                       <div className={`avatar-lg rounded-3 ${m.type === 'pdf' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                          <FontAwesomeIcon icon={m.type === 'pdf' ? faFilePdf : faPlayCircle} size="xl" />
                       </div>
                       <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{m.title}</h6>
                          <div className="text-muted x-small d-flex gap-3">
                             <span><FontAwesomeIcon icon={faBook} className="me-1" /> {m.category}</span>
                             <span>{m.type === 'pdf' ? m.size : m.duration}</span>
                          </div>
                       </div>
                       <button className="btn btn-icon btn-light text-primary shadow-sm">
                          <FontAwesomeIcon icon={faDownload} />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SubjectContent;
