import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faChartLine, 
  faBell, 
  faUserCircle 
} from '@fortawesome/free-solid-svg-icons';

const ParentSidebar = () => {
  return (
    <nav className="nav flex-column">
      <NavLink to="/parent" end className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faHome} className="ms-2" />
        الرئيسية
      </NavLink>
      <NavLink to="/parent/children" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUsers} className="ms-2" />
        الأبناء
      </NavLink>
      <NavLink to="/parent/reports" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faChartLine} className="ms-2" />
        التقارير الشاملة
      </NavLink>
      <NavLink to="/parent/notifications" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faBell} className="ms-2" />
        الإشعارات
      </NavLink>
      <NavLink to="/parent/profile" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUserCircle} className="ms-2" />
        الملف الشخصي
      </NavLink>
    </nav>
  );
};

export default ParentSidebar;
