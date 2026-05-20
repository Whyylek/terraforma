import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList, Users, TrendingUp, Calendar,
  CheckCircle, Clock, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Order, User } from '@/types';

export default function AdminOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/orders'),
          fetch('http://localhost:5000/api/users')
        ]);
        if (!ordersRes.ok || !usersRes.ok) throw new Error('Помилка');
        
        setOrders(await ordersRes.json());
        setUsers(await usersRes.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити статистику');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'new').length;
  const activeOrders = orders.filter(o => ['scheduled', 'in_progress'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid').length;
  
  const totalClients = users.filter(u => u.role === 'client').length;
  const totalWorkers = users.filter(u => u.role === 'worker').length;
  
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-purple-500" />;
      case 'completed':
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const dict: Record<string, string> = { new: 'Нове', scheduled: 'Заплановано', in_progress: 'В роботі', completed: 'Виконано', paid: 'Оплачено' };
    return dict[status] || status;
  };

  const getStatusClass = (status: string) => {
    const dict: Record<string, string> = { new: 'bg-amber-100 text-amber-700', scheduled: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700', paid: 'bg-green-600 text-white' };
    return dict[status] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 text-purple-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Панель керування</h1><p className="text-gray-600">Огляд бізнес-показників</p></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Всього замовлень</p><p className="text-2xl font-bold text-gray-900">{totalOrders}</p></div><div className="bg-blue-100 p-3 rounded-lg"><ClipboardList className="h-6 w-6 text-blue-600" /></div></div><div className="mt-3 flex items-center text-sm"><span className="text-amber-600 font-medium">{newOrders}</span><span className="text-gray-500 ml-1">нових</span></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Клієнтів</p><p className="text-2xl font-bold text-gray-900">{totalClients}</p></div><div className="bg-green-100 p-3 rounded-lg"><Users className="h-6 w-6 text-green-600" /></div></div><div className="mt-3 flex items-center text-sm"><span className="text-purple-600 font-medium">{totalWorkers}</span><span className="text-gray-500 ml-1">працівників</span></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Виручка</p><p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} ₴</p></div><div className="bg-purple-100 p-3 rounded-lg"><TrendingUp className="h-6 w-6 text-purple-600" /></div></div><div className="mt-3 flex items-center text-sm"><span className="text-amber-600 font-medium">{pendingRevenue.toLocaleString()} ₴</span><span className="text-gray-500 ml-1">очікує</span></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Активні</p><p className="text-2xl font-bold text-gray-900">{activeOrders}</p></div><div className="bg-amber-100 p-3 rounded-lg"><Clock className="h-6 w-6 text-amber-600" /></div></div><div className="mt-3 flex items-center text-sm"><span className="text-green-600 font-medium">{completedOrders}</span><span className="text-gray-500 ml-1">виконано</span></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Останні замовлення</CardTitle><Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">Всі замовлення<ArrowRight className="ml-1 h-4 w-4" /></Link></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-4">{getStatusIcon(order.status)}<div><div className="flex items-center space-x-2"><p className="font-medium text-gray-900">{order.id}</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>{getStatusText(order.status)}</span></div><p className="text-sm text-gray-600">{order.client_name}</p><p className="text-sm text-gray-500 line-clamp-1">{order.description}</p></div></div>
                <div className="text-right">{order.total_amount ? (<p className="font-bold text-gray-900">{Number(order.total_amount).toLocaleString()} ₴</p>) : (<p className="text-sm text-gray-500">Очікує оцінки</p>)}<p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('uk-UA')}</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}