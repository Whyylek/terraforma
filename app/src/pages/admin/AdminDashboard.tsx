import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp
} from 'lucide-react';

// Admin sub-pages
import AdminOverview from './AdminOverview';
import AdminOrders from './AdminOrders';
import AdminSchedule from './AdminSchedule';
import AdminWorkers from './AdminWorkers';
import AdminFinances from './AdminFinances';

const sidebarItems = [
  { path: '/admin', label: 'Огляд', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Замовлення', icon: ClipboardList },
  { path: '/admin/schedule', label: 'Розклад', icon: CalendarIcon },
  { path: '/admin/workers', label: 'Працівники', icon: Users },
  { path: '/admin/finances', label: 'Фінанси', icon: TrendingUp },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <div className="mb-6 px-4">
                <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Адміністратор
                </span>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/schedule" element={<AdminSchedule />} />
              <Route path="/workers" element={<AdminWorkers />} />
              <Route path="/finances" element={<AdminFinances />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
