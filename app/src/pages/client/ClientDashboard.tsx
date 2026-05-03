import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar as CalendarIcon, 
  FileText, 
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Client sub-pages
import ClientOverview from './ClientOverview';
import ClientOrders from './ClientOrders';
import ClientCalendar from './ClientCalendar';
import ClientInvoices from './ClientInvoices';
import ClientNewOrder from './ClientNewOrder';
import AIAssistant from '@/components/AIAssistant';

const sidebarItems = [
  { path: '/client', label: 'Огляд', icon: LayoutDashboard },
  { path: '/client/orders', label: 'Мої замовлення', icon: ClipboardList },
  { path: '/client/calendar', label: 'Календар', icon: CalendarIcon },
  { path: '/client/invoices', label: 'Рахунки', icon: FileText },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/client') {
      return location.pathname === '/client';
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
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Клієнт
                </span>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link to="/client/orders/new">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Нове замовлення
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<ClientOverview />} />
              <Route path="/orders" element={<ClientOrders />} />
              <Route path="/orders/new" element={<ClientNewOrder />} />
              <Route path="/calendar" element={<ClientCalendar />} />
              <Route path="/invoices" element={<ClientInvoices />} />
              <Route path="*" element={<Navigate to="/client" replace />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
