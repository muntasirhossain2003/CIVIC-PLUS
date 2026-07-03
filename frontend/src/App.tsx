import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Layout
import { Shell } from './components/layout/Shell';

// Auth screens (no sidebar)
import { Login }          from './screens/auth/Login';
import { Register }       from './screens/auth/Register';
import { VerifyEmail }    from './screens/auth/VerifyEmail';
import { ForgotPassword } from './screens/auth/ForgotPassword';
import { ResetPassword }  from './screens/auth/ResetPassword';

// Public screens
import { CitizenHome }  from './screens/citizen-home/CitizenHome';
import { Transparency } from './screens/transparency/Transparency';
import { IssueDetail }  from './screens/issue-detail/IssueDetail';

// Citizen screens
import { ReportFlow }   from './screens/report-flow/ReportFlow';
import { Dashboard }    from './screens/dashboard/Dashboard';
import { Notifications } from './screens/notifications/Notifications';
import { Profile } from './screens/profile/Profile';

// Staff screens
import { StaffQueue }   from './screens/staff-queue/StaffQueue';

// Admin screens
import { AdminAnalytics }   from './screens/admin/AdminAnalytics';
import { AdminUsers }       from './screens/admin/AdminUsers';
import { AdminDepartments } from './screens/admin/AdminDepartments';
import { AdminCategories }  from './screens/admin/AdminCategories';
import { AdminAuditLogs }   from './screens/admin/AdminAuditLogs';

function ShellLayout() {
  return <Shell><Outlet /></Shell>;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user && roles.includes(user.role) ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth — no Shell */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* App — inside Shell */}
          <Route element={<ShellLayout />}>
            {/* Public */}
            <Route path="/"             element={<CitizenHome />} />
            <Route path="/issues/:id"   element={<IssueDetail />} />
            <Route path="/transparency" element={<Transparency />} />

            {/* Citizen */}
            <Route path="/report"        element={<RequireAuth><ReportFlow /></RequireAuth>} />
            <Route path="/dashboard"     element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/profile"       element={<RequireAuth><Profile /></RequireAuth>} />

            {/* Staff */}
            <Route path="/staff/queue" element={
              <RequireAuth><RequireRole roles={['staff','admin']}><StaffQueue /></RequireRole></RequireAuth>
            } />

            {/* Admin */}
            <Route path="/admin/analytics" element={
              <RequireAuth><RequireRole roles={['admin']}><AdminAnalytics /></RequireRole></RequireAuth>
            } />
            <Route path="/admin/users" element={
              <RequireAuth><RequireRole roles={['admin']}><AdminUsers /></RequireRole></RequireAuth>
            } />
            <Route path="/admin/departments" element={
              <RequireAuth><RequireRole roles={['admin']}><AdminDepartments /></RequireRole></RequireAuth>
            } />
            <Route path="/admin/categories" element={
              <RequireAuth><RequireRole roles={['admin']}><AdminCategories /></RequireRole></RequireAuth>
            } />
            <Route path="/admin/audit-logs" element={
              <RequireAuth><RequireRole roles={['admin']}><AdminAuditLogs /></RequireRole></RequireAuth>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
