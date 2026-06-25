import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChild, faUserCircle, faSchool, faGraduationCap, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ParentChildren = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axiosInstance.get('/parent/children');
        setChildren(res.data?.data || [
           { id: 10, name: 'أحمد محمد', grade: 'التاسع', school: 'النهضة الحديثة', level: 'الإعدادي' },
           { id: 11, name: 'خالد محمد', grade: 'السابع', school: 'النهضة الحديثة', level: 'الإعدادي' }
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchChildren();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
        <div>
          <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>إدارة الأبناء</h2>
          <p className="mb-0 opacity-80 small">عرض ومتابعة كافة الأبناء المسجلين في المدارس التابعة للنظام</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="row g-4">
           {children.map(child => (
              <div className="col-md-6 col-lg-4" key={child.student_id || child.id}>
                 <div className="card border-0 shadow-sm h-100 transition-hover">
                    <div className="card-body text-center p-4">
                       <div className="avatar-lg bg-primary bg-opacity-10 text-primary mx-auto mb-3" style={{ width: 80, height: 80 }}>
                          <FontAwesomeIcon icon={faChild} size="2x" />
                       </div>
                       <h5 className="fw-bold mb-1">{child.name}</h5>
                       <p className="small text-muted mb-4">{child.class_name || child.grade} - {child.school_name || child.school}</p>
                       
                       <Link to={`/parent?childId=${child.student_id || child.id}`} className="btn btn-outline-primary w-100 rounded-pill py-2">
                          توجّه للوحة المتابعة <FontAwesomeIcon icon={faChevronLeft} className="ms-1" size="xs" />
                       </Link>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default ParentChildren;
