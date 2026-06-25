import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faUsers, faChalkboardTeacher, faGraduationCap,
  faClipboardList, faBell, faCogs, faLayerGroup, faBuilding,
  faChartPie, faBook, faBrain
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  {
    group: 'لوحة التحكم',
    links: [
      { to: '/admin', icon: faHome, label: 'الرئيسية', end: true },
      { to: '/admin/stats', icon: faChartPie, label: 'إحصائيات المدرسة' },
    ]
  },
  {
    group: 'إدارة البيانات',
    links: [
      { to: '/admin/profile', icon: faBuilding, label: 'بيانات المدرسة' },
      { to: '/admin/structure', icon: faLayerGroup, label: 'الصفوف والشعب' },
      { to: '/admin/teachers', icon: faChalkboardTeacher, label: 'إدارة المعلمين' },
      { to: '/admin/assignments', icon: faBook, label: 'نصاب المعلمين' },
      { to: '/admin/students', icon: faGraduationCap, label: 'إدارة الطلاب' },
    ]
  },
  {
    group: 'المتابعة اليومية',
    links: [
      { to: '/admin/attendance', icon: faClipboardList, label: 'كشوفات التحضير' },
      { to: '/admin/grades-approval', icon: faClipboardList, label: 'اعتماد الدرجات' },
    ]
  },
  {
    group: 'النظام والذكاء',
    links: [
      { to: '/admin/ai-insights', icon: faBrain, label: 'توصيات الذكاء' },
      { to: '/admin/settings', icon: faCogs, label: 'الإعدادات' },
    ]
  },
  {
    group: 'إعدادات شخصية',
    links: [
      { to: '/admin/my-notifications', icon: faBell, label: 'إشعاراتي' },
      { to: '/admin/my-profile', icon: faUsers, label: 'ملفي الشخصي' },
    ]
  },
];

const SchoolAdminSidebar = () => {
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

export default SchoolAdminSidebar;
