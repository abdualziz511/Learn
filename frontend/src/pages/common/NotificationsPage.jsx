import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faInfoCircle, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';

const NotificationsPage = ({ title = 'الإشعارات' }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data?.data || [
           { id: 1, type: 'info', text: 'تم تحديث جدول الحصص للأسبوع القادم', time: 'منذ ساعتين', read: false },
           { id: 2, type: 'success', text: 'تم اعتماد درجات اختبار شهر أكتوبر', time: 'أمس', read: true },
           { id: 3, type: 'warning', text: 'لديك واجب مدرسي ينتهي موعده غداً', time: 'منذ 5 ساعات', read: false },
        ]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <div className="page-hero mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-900 mb-0" style={{ fontFamily: 'Cairo' }}>{title}</h2>
            <p className="mb-0 opacity-80 small">ابقَ على اطلاع بأحدث التنبيهات والأخبار المتعلقة بمسارك التعليمي</p>
          </div>
          <button className="btn btn-white text-primary btn-sm rounded-pill">تحديد الكل كمقروء</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-primary"></div></div>
      ) : (
        <div className="row g-3">
           {notifications.map(n => (
              <div className="col-12" key={n.id}>
                 <div className={`card border-0 shadow-sm transition-hover ${!n.read ? 'border-primary border-start border-4' : ''}`}>
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                       <div className={`avatar rounded-3 ${
                          n.type === 'success' ? 'bg-success bg-opacity-10 text-success' :
                          n.type === 'warning' ? 'bg-warning bg-opacity-10 text-warning' :
                          'bg-info bg-opacity-10 text-info'
                       }`}>
                          <FontAwesomeIcon icon={n.type === 'success' ? faCheckCircle : n.type === 'warning' ? faExclamationTriangle : faBell} />
                       </div>
                       <div className="flex-grow-1">
                          <div className={`small ${!n.read ? 'fw-bold text-dark' : 'text-muted'}`}>{n.text}</div>
                          <div className="x-small text-muted mt-1">{n.time}</div>
                       </div>
                       <button className="btn btn-icon btn-light text-muted btn-sm"><FontAwesomeIcon icon={faTrash} size="xs" /></button>
                    </div>
                 </div>
              </div>
           ))}
           {notifications.length === 0 && (
              <div className="text-center py-5 text-muted">
                 <FontAwesomeIcon icon={faBell} size="4x" className="mb-3 opacity-20" />
                 <h5>لا توجد إشعارات حالياً</h5>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
