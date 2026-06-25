import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faTasks, 
  faBook, 
  faGraduationCap, 
  faBell, 
  faUser 
} from '@fortawesome/free-solid-svg-icons';

const StudentSidebar = () => {
  return (
    <nav className="nav flex-column">
      <NavLink to="/student" end className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faHome} className="ms-2" />
        الرئيسية
      </NavLink>
      <NavLink to="/student/assignments" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faTasks} className="ms-2" />
        الواجبات
      </NavLink>
      <NavLink to="/student/subjects" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faBook} className="ms-2" />
        المواد الدراسية
      </NavLink>
      <NavLink to="/student/exams" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faGraduationCap} className="ms-2" />
        الاختبارات
      </NavLink>
      <NavLink to="/student/notifications" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faBell} className="ms-2" />
        الإشعارات
      </NavLink>
      <NavLink to="/student/profile" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUser} className="ms-2" />
        الملف الشخصي
      </NavLink>
    </nav>
  );
};

export default StudentSidebar;
