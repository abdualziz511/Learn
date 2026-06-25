import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSchool, 
  faClipboardList, 
  faStar, 
  faBookOpen,
  faBell, 
  faUser 
} from '@fortawesome/free-solid-svg-icons';

const TeacherSidebar = () => {
  return (
    <nav className="nav flex-column">
      <NavLink to="/teacher" end className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faHome} className="ms-2" />
        الرئيسية
      </NavLink>
      <NavLink to="/teacher/schools" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faSchool} className="ms-2" />
        المدارس والصفوف
      </NavLink>
      <NavLink to="/teacher/attendance" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
        المتابعة اليومية
      </NavLink>
      <NavLink to="/teacher/grades" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faStar} className="ms-2" />
        الدرجات
      </NavLink>
      <NavLink to="/teacher/content" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faBookOpen} className="ms-2" />
        المواد التعليمية
      </NavLink>
      <NavLink to="/teacher/notifications" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faBell} className="ms-2" />
        الإشعارات
      </NavLink>
      <NavLink to="/teacher/profile" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUser} className="ms-2" />
        الملف الشخصي
      </NavLink>
    </nav>
  );
};

export default TeacherSidebar;
