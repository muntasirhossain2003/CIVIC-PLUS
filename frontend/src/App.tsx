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

// Screens
import { Transparency } from './screens/transparency/Transparency';

// Placeholder for screens being built
function Placeholder({ name }: { name: string }) {
  return (
    <div style={{ padding: 48, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
      {name} — coming soon
    </div>
  );
}

// Layout wrapper using React Router Outlet
function ShellLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user?.role === role ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth — no Shell, centered card layout */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* All app screens inside Shell (sidebar + main) */}
          <Route element={<ShellLayout />}>
            {/* Public */}
            <Route path="/"             element={<Placeholder name="CitizenHome / Live Map" />} />
            <Route path="/issues"       element={<Placeholder name="Issue List" />} />
            <Route path="/issues/:id"   element={<Placeholder name="Issue Detail" />} />
            <Route path="/transparency" element={<Transparency />} />

            {/* Citizen (auth required) */}
            <Route path="/report"        element={<RequireAuth><Placeholder name="Report Issue" /></RequireAuth>} />
            <Route path="/dashboard"     element={<RequireAuth><Placeholder name="My Dashboard" /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Placeholder name="Notifications" /></RequireAuth>} />
            <Route path="/profile"       element={<RequireAuth><Placeholder name="Profile" /></RequireAuth>} />

            {/* Staff */}
            <Route path="/staff/queue"      element={<RequireAuth><RequireRole role="staff"><Placeholder name="Staff Queue" /></RequireRole></RequireAuth>} />
            <Route path="/staff/issues/:id" element={<RequireAuth><RequireRole role="staff"><Placeholder name="Staff Issue Detail" /></RequireRole></RequireAuth>} />

            {/* Admin */}
            <Route path="/admin/analytics"   element={<RequireAuth><RequireRole role="admin"><Placeholder name="Admin Analytics" /></RequireRole></RequireAuth>} />
            <Route path="/admin/users"       element={<RequireAuth><RequireRole role="admin"><Placeholder name="User Management" /></RequireRole></RequireAuth>} />
            <Route path="/admin/departments" element={<RequireAuth><RequireRole role="admin"><Placeholder name="Departments" /></RequireRole></RequireAuth>} />
            <Route path="/admin/categories"  element={<RequireAuth><RequireRole role="admin"><Placeholder name="Categories" /></RequireRole></RequireAuth>} />
            <Route path="/admin/audit-logs"  element={<RequireAuth><RequireRole role="admin"><Placeholder name="Audit Logs" /></RequireRole></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
