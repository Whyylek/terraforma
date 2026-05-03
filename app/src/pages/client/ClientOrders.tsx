import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mockOrders } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ClientOrders() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  
  const userOrders = mockOrders.filter(o => o.client_id === user?.id);
  
  const activeOrders = userOrders.filter(o => ['new', 'scheduled', 'in_progress'].includes(o.status));
  const completedOrders = userOrders.filter(o => o.status === 'completed' || o.status === 'paid');

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

  const OrderCard = ({ order }: { order: typeof mockOrders[0] }) => (
    <div 
      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {getStatusIcon(order.status)}
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{order.id}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{order.description}</p>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              {order.address}
            </div>
            {order.scheduled_date && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Заплановано: {new Date(order.scheduled_date).toLocaleDateString('uk-UA')}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          {order.total_amount ? (
            <p className="text-lg font-bold text-green-600">{order.total_amount.toLocaleString()} ₴</p>
          ) : (
            <p className="text-sm text-gray-500">Очікує оцінки</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мої замовлення</h1>
          <p className="text-gray-600">Керуйте своїми замовленнями та відстежуйте статус</p>
        </div>
        <Link to="/client/orders/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Нове замовлення
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Активні ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Виконані ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Всі ({userOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Немає активних замовлень</p>
                <Link to="/client/orders/new">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    Створити замовлення
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ще немає виконаних замовлень</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {userOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">У вас ще немає замовлень</p>
                <Link to="/client/orders/new">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    Створити замовлення
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>Замовлення {selectedOrder.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Опис робіт</h4>
                  <p className="text-gray-700">{selectedOrder.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Адреса</h4>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedOrder.address}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Дата створення</h4>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(selectedOrder.created_at).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>

                {selectedOrder.scheduled_date && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Запланована дата</h4>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(selectedOrder.scheduled_date).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                )}

                {selectedOrder.manager_notes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Нотатки менеджера</h4>
                    <p className="text-blue-800">{selectedOrder.manager_notes}</p>
                  </div>
                )}

                {selectedOrder.total_amount && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Фінансовий звіт</h4>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.work_hours && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Робота ({selectedOrder.work_hours} год × {selectedOrder.hourly_rate} ₴)</span>
                          <span>{(selectedOrder.work_hours * (selectedOrder.hourly_rate || 0)).toLocaleString()} ₴</span>
                        </div>
                      )}
                      {selectedOrder.transport_km && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Транспорт ({selectedOrder.transport_km} км × {selectedOrder.transport_rate} ₴)</span>
                          <span>{(selectedOrder.transport_km * (selectedOrder.transport_rate || 0)).toLocaleString()} ₴</span>
                        </div>
                      )}
                      {selectedOrder.materials_cost && selectedOrder.materials_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Матеріали</span>
                          <span>{selectedOrder.materials_cost.toLocaleString()} ₴</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Всього</span>
                        <span className="text-green-600">{selectedOrder.total_amount.toLocaleString()} ₴</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
