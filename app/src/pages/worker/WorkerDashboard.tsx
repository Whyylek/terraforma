import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Wallet
} from 'lucide-react';


import WorkerOverview from './WorkerOverview';
import WorkerSchedule from './WorkerSchedule';
import WorkerReports from './WorkerReports';
import WorkerSalary from './WorkerSalary';

const sidebarItems = [
  { path: '/worker', label: 'Огляд', icon: LayoutDashboard },
  { path: '/worker/schedule', label: 'Мій розклад', icon: CalendarIcon },
  { path: '/worker/reports', label: 'Звіти', icon: ClipboardCheck },
  { path: '/worker/salary', label: 'Зарплата', icon: Wallet },
];

export default function WorkerDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/worker') {
      return location.pathname === '/worker';
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
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Працівник
                </span>
                {user?.salary_hourly_rate && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ставка: {user.salary_hourly_rate} ₴/год
                  </p>
                )}
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
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
              <Route path="/" element={<WorkerOverview />} />
              <Route path="/schedule" element={<WorkerSchedule />} />
              <Route path="/reports" element={<WorkerReports />} />
              <Route path="/salary" element={<WorkerSalary />} />
              <Route path="*" element={<Navigate to="/worker" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
