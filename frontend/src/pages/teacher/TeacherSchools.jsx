import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSchool, faUsers, faBook, faArrowLeft, faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const TeacherSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axiosInstance.get('/teacher/schools');
        setSchools(res.data?.data || [
           { id: 1, name: 'مدرسة النهضة الحديثة', city: 'صنعاء', classes_count: 3, subjects: 'الرياضيات، الفيزياء' },
           { id: 2, name: 'مدارس وحدة صنعاء', city: 'صنعاء', classes_count: 2, subjects: 'الرياضيات' }
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSchools();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
        <div>
          <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>المدارس والصفوف المسندة</h2>
          <p className="mb-0 opacity-80">اختر المدرسة والفصل لبدء عملية التحضير والمتابعة</p>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="row g-4">
          {schools.map(school => (
            <div className="col-12" key={school.id}>
              <div className="card shadow-sm border-0 overflow-hidden transition-hover">
                <div className="card-body p-0">
                   <div className="row g-0">
                      <div className="col-md-3 bg-primary bg-opacity-10 d-flex flex-column align-items-center justify-content-center p-4">
                         <div className="avatar-lg bg-white text-primary mb-3 shadow-sm">
                            <FontAwesomeIcon icon={faSchool} size="2x" />
                         </div>
                         <h5 className="fw-bold mb-1 text-center">{school.name}</h5>
                         <div className="text-muted small">{school.city}</div>
                      </div>
                      <div className="col-md-9 p-4">
                         <div className="row g-4 mb-4">
                            <div className="col-md-4">
                               <div className="d-flex align-items-center gap-3">
                                  <div className="stat-icon-box sm bg-light text-primary">
                                     <FontAwesomeIcon icon={faUsers} />
                                  </div>
                                  <div>
                                     <div className="text-muted x-small fw-bold">الفصول المسندة</div>
                                     <div className="fw-bold">{school.classes_count} فصول</div>
                                  </div>
                               </div>
                            </div>
                            <div className="col-md-8">
                               <div className="d-flex align-items-center gap-3">
                                  <div className="stat-icon-box sm bg-light text-success">
                                     <FontAwesomeIcon icon={faBook} />
                                  </div>
                                  <div>
                                     <div className="text-muted x-small fw-bold">المواد التي تدرسها</div>
                                     <div className="fw-bold">{school.subjects}</div>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="divider mb-4"></div>
                         
                         <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">آخر تحضير: <span className="text-dark fw-bold">اليوم، 08:30 ص</span></div>
                            <Link to={`/teacher/attendance?school=${school.id}`} className="btn btn-primary d-flex align-items-center gap-2 px-4">
                               <span>توجـه للفصول</span>
                               <FontAwesomeIcon icon={faChevronCircleLeft} />
                            </Link>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSchools;
