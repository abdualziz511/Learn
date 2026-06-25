import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faCity, faUserShield, faBook, faBrain,
  faCogs, faChartBar, faUsers, faGraduationCap, faBell
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  {
    group: 'لوحة التحكم',
    links: [
      { to: '/super', icon: faHome, label: 'الرئيسية', end: true },
      { to: '/super/stats', icon: faChartBar, label: 'الإحصائيات' },
    ]
  },
  {
    group: 'الإدارة',
    links: [
      { to: '/super/schools', icon: faCity, label: 'إدارة المدارس' },
      { to: '/super/admins', icon: faUserShield, label: 'مدراء المدارس' },
      { to: '/super/users', icon: faUsers, label: 'جميع المستخدمين' },
    ]
  },
  {
    group: 'المحتوى الأكاديمي',
    links: [
      { to: '/super/content', icon: faBook, label: 'المحتوى المركزي' },
      { to: '/super/academic', icon: faGraduationCap, label: 'الهيكل الأكاديمي' },
    ]
  },
  {
    group: 'النظام',
    links: [
      { to: '/super/ai', icon: faBrain, label: 'الذكاء الاصطناعي' },
      { to: '/super/settings', icon: faCogs, label: 'إعدادات النظام' },
    ]
  },
  {
    group: 'إعدادات شخصية',
    links: [
      { to: '/super/notifications', icon: faBell, label: 'إشعاراتي' },
      { to: '/super/profile', icon: faUserShield, label: 'ملفي الشخصي' },
    ]
  },
];

const SuperAdminSidebar = () => {
  return (
    <div>
      {navItems.map((section) => (
        <div key={section.group}>
          <div className="sidebar-section-title">{section.group}</div>
          {section.links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SuperAdminSidebar;
