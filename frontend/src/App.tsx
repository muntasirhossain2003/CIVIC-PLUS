import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex h-screen items-center justify-center" style={{ color: 'var(--muted)' }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{name} — coming soon</span>
  </div>
);

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
          {/* Public */}
          <Route path="/"                element={<Placeholder name="CitizenHome / Live Map" />} />
          <Route path="/issues"          element={<Placeholder name="Issue List" />} />
          <Route path="/issues/:id"      element={<Placeholder name="Issue Detail" />} />
          <Route path="/transparency"    element={<Placeholder name="Transparency Dashboard" />} />
          <Route path="/login"           element={<Placeholder name="Login" />} />
          <Route path="/register"        element={<Placeholder name="Register" />} />
          <Route path="/verify-email"    element={<Placeholder name="Verify Email" />} />
          <Route path="/forgot-password" element={<Placeholder name="Forgot Password" />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
