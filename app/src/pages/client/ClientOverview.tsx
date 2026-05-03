import { useAuth } from '@/hooks/useAuth';
import { mockOrders } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientOverview() {
  const { user } = useAuth();
  const userOrders = mockOrders.filter(o => o.client_id === user?.id);
  
  const activeOrders = userOrders.filter(o => ['new', 'scheduled', 'in_progress'].includes(o.status));
  const completedOrders = userOrders.filter(o => o.status === 'completed' || o.status === 'paid');
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Нове';
      case 'scheduled':
        return 'Заплановано';
      case 'in_progress':
        return 'В роботі';
      case 'completed':
        return 'Виконано';
      case 'paid':
        return 'Оплачено';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Вітаємо, {user?.name}!</h1>
        <p className="text-gray-600">Ось огляд вашої активності</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Всього замовлень</p>
                <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Активні замовлення</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Виконано</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Витрачено</p>
                <p className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString()} ₴</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Останні замовлення</CardTitle>
          <Link to="/client/orders">
            <Button variant="ghost" size="sm">
              Всі замовлення
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {userOrders.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">У вас ще немає замовлень</p>
              <Link to="/client/orders/new">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  Створити замовлення
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.slice(0, 3).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{order.description}</p>
                      <p className="text-sm text-gray-500">{order.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    {order.total_amount && (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {order.total_amount.toLocaleString()} ₴
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/client/orders/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-green-100 p-4 rounded-xl">
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Нове замовлення</h3>
                <p className="text-sm text-gray-600">Створити запит на послуги</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/client/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Календар</h3>
                <p className="text-sm text-gray-600">Перевірити доступні дати</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
