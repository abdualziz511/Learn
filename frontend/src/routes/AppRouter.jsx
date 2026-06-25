import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import StudentSidebar from '../layouts/sidebars/StudentSidebar';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAssignments from '../pages/student/StudentAssignments';
import StudentSubjects from '../pages/student/StudentSubjects';
import StudentExams from '../pages/student/StudentExams';
import NotificationsPage from '../pages/common/NotificationsPage';
import ProfilePage from '../pages/common/ProfilePage';
import TeacherSidebar from '../layouts/sidebars/TeacherSidebar';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherSchools from '../pages/teacher/TeacherSchools';
import TeacherAttendance from '../pages/teacher/TeacherAttendance';
import GradeSubmission from '../pages/teacher/GradeSubmission';
import SubjectContent from '../pages/teacher/SubjectContent';
import SchoolAdminSidebar from '../layouts/sidebars/SchoolAdminSidebar';
import SchoolAdminDashboard from '../pages/school-admin/SchoolAdminDashboard';
import ManageStudents from '../pages/school-admin/ManageStudents';
import ManageTeachers from '../pages/school-admin/ManageTeachers';
import ManageAssignments from '../pages/school-admin/ManageAssignments';
import ManageSchoolProfile from '../pages/school-admin/ManageSchoolProfile';
import ManageSchoolStructure from '../pages/school-admin/ManageSchoolStructure';
import ManageAttendance from '../pages/school-admin/ManageAttendance';
import ManageGradesApproval from '../pages/school-admin/ManageGradesApproval';
import SchoolAINotifications from '../pages/school-admin/SchoolAINotifications';
import SchoolStats from '../pages/school-admin/SchoolStats';
import SystemSettingsSchool from '../pages/super-admin/SystemSettings';
import ParentSidebar from '../layouts/sidebars/ParentSidebar';
import ParentDashboard from '../pages/parent/ParentDashboard';
import ParentChildren from '../pages/parent/ParentChildren';
import ParentReports from '../pages/parent/ParentReports';
import SuperAdminSidebar from '../layouts/sidebars/SuperAdminSidebar';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import ManageSchools from '../pages/super-admin/ManageSchools';
import AcademicStructure from '../pages/super-admin/AcademicStructure';
import ManageUsers from '../pages/super-admin/ManageUsers';
import AISettings from '../pages/super-admin/AISettings';
import SystemSettings from '../pages/super-admin/SystemSettings';
import CentralContent from '../pages/super-admin/CentralContent';
import SystemStats from '../pages/super-admin/SystemStats';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout sidebar={StudentSidebar}><Outlet /></DashboardLayout>}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/subjects" element={<StudentSubjects />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/notifications" element={<NotificationsPage title="إشعارات الطالب" />} />
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Parent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route element={<DashboardLayout sidebar={ParentSidebar}><Outlet /></DashboardLayout>}>
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/reports" element={<ParentReports />} />
          <Route path="/parent/notifications" element={<NotificationsPage title="إشعارات ولي الأمر" />} />
          <Route path="/parent/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<DashboardLayout sidebar={TeacherSidebar}><Outlet /></DashboardLayout>}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/schools" element={<TeacherSchools />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/grades" element={<GradeSubmission />} />
          <Route path="/teacher/content" element={<SubjectContent />} />
          <Route path="/teacher/notifications" element={<NotificationsPage title="إشعارات المعلم" />} />
          <Route path="/teacher/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* School Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['school_admin']} />}>
        <Route element={<DashboardLayout sidebar={SchoolAdminSidebar}><Outlet /></DashboardLayout>}>
          <Route path="/admin" element={<SchoolAdminDashboard />} />
          <Route path="/admin/stats" element={<SchoolStats />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/teachers" element={<ManageTeachers />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
          <Route path="/admin/profile" element={<ManageSchoolProfile />} />
          <Route path="/admin/structure" element={<ManageSchoolStructure />} />
          <Route path="/admin/attendance" element={<ManageAttendance />} />
          <Route path="/admin/grades-approval" element={<ManageGradesApproval />} />
          <Route path="/admin/ai-insights" element={<SchoolAINotifications />} />
          <Route path="/admin/settings" element={<SystemSettingsSchool />} />
          <Route path="/admin/my-notifications" element={<NotificationsPage title="إشعارات الإدارة" />} />
          <Route path="/admin/my-profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route element={<DashboardLayout sidebar={SuperAdminSidebar}><Outlet /></DashboardLayout>}>
          <Route path="/super" element={<SuperAdminDashboard />} />
          <Route path="/super/schools" element={<ManageSchools />} />
          <Route path="/super/users" element={<ManageUsers />} />
          <Route path="/super/admins" element={<ManageUsers />} />
          <Route path="/super/content" element={<CentralContent />} />
          <Route path="/super/academic" element={<AcademicStructure />} />
          <Route path="/super/ai" element={<AISettings />} />
          <Route path="/super/settings" element={<SystemSettings />} />
          <Route path="/super/stats" element={<SystemStats />} />
          <Route path="/super/notifications" element={<NotificationsPage title="إشعارات النظام" />} />
          <Route path="/super/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-4 text-center text-light">404 - الصفحة غير موجودة</div>} />
    </Routes>
  );
};

export default AppRouter;
