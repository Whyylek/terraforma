import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    status: '',
    scheduled_date: '',
    work_hours: '',
    hourly_rate: '',
    transport_km: '',
    transport_rate: '15',
    materials_cost: '',
    manager_notes: '',
  });


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) throw new Error('Помилка завантаження');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити замовлення');
    } finally {
      setIsLoading(false);
    }
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const scheduledOrders = orders.filter(o => o.status === 'scheduled');
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');

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
    const statuses: Record<string, string> = {
      new: 'Нове',
      scheduled: 'Заплановано',
      in_progress: 'В роботі',
      completed: 'Виконано',
      paid: 'Оплачено',
      cancelled: 'Скасовано',
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-amber-100 text-amber-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'paid': return 'bg-green-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    
   
    const formattedDate = order.scheduled_date 
      ? new Date(order.scheduled_date).toISOString().split('T')[0] 
      : '';

    setEditData({
      status: order.status,
      scheduled_date: formattedDate,
      work_hours: order.work_hours?.toString() || '',
      hourly_rate: order.hourly_rate?.toString() || '',
      transport_km: order.transport_km?.toString() || '',
      transport_rate: order.transport_rate?.toString() || '15',
      materials_cost: order.materials_cost?.toString() || '',
      manager_notes: order.manager_notes || '',
    });
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);

    
    const workCost = (parseFloat(editData.work_hours) || 0) * (parseFloat(editData.hourly_rate) || 0);
    const transportCost = (parseFloat(editData.transport_km) || 0) * (parseFloat(editData.transport_rate) || 0);
    const materialsCost = parseFloat(editData.materials_cost) || 0;
    const totalAmount = workCost + transportCost + materialsCost;

    const updatedOrderData = {
      status: editData.status,
      scheduled_date: editData.scheduled_date || null,
      work_hours: editData.work_hours ? parseFloat(editData.work_hours) : null,
      hourly_rate: editData.hourly_rate ? parseFloat(editData.hourly_rate) : null,
      transport_km: editData.transport_km ? parseFloat(editData.transport_km) : null,
      transport_rate: editData.transport_rate ? parseFloat(editData.transport_rate) : null,
      materials_cost: editData.materials_cost ? parseFloat(editData.materials_cost) : null,
      manager_notes: editData.manager_notes,
      total_amount: totalAmount > 0 ? totalAmount : null,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrderData),
      });

      if (!response.ok) throw new Error('Помилка оновлення');

      const updatedOrder = await response.json();

     
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      
      toast.success('Замовлення успішно оновлено!');
      setIsEditMode(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося зберегти зміни');
    } finally {
      setIsSaving(false);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div 
      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="flex items-start space-x-4">
        {getStatusIcon(order.status)}
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{order.id}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{order.client_name}</p>
          <p className="text-sm text-gray-500">{order.client_phone}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{order.description}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {order.address}
          </div>
        </div>
      </div>
      <div className="text-right">
        {order.total_amount ? (
          <p className="font-bold text-gray-900">{Number(order.total_amount).toLocaleString()} ₴</p>
        ) : (
          <p className="text-sm text-gray-500">Очікує оцінки</p>
        )}
        <p className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleDateString('uk-UA')}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Замовлення</h1>
          <p className="text-gray-600">Керуйте всіма замовленнями</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">Нові ({newOrders.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Заплановані ({scheduledOrders.length})</TabsTrigger>
          <TabsTrigger value="in_progress">В роботі ({inProgressOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Завершені ({completedOrders.length})</TabsTrigger>
        </TabsList>

        {/* ... Tab Contents ... */}
        <TabsContent value="new" className="space-y-4">
          {newOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-gray-500">Немає нових замовлень</p></CardContent></Card>
          ) : (
            <div className="space-y-4">{newOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-gray-500">Немає запланованих замовлень</p></CardContent></Card>
          ) : (
            <div className="space-y-4">{scheduledOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-gray-500">Немає замовлень в роботі</p></CardContent></Card>
          ) : (
            <div className="space-y-4">{inProgressOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-gray-500">Ще немає завершених замовлень</p></CardContent></Card>
          ) : (
            <div className="space-y-4">{completedOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for details and editing */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if(!open) { setSelectedOrder(null); setIsEditMode(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && !isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Замовлення {selectedOrder.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Клієнт</h4>
                    <p className="text-gray-700">{selectedOrder.client_name}</p>
                    <p className="text-gray-600">{selectedOrder.client_phone}</p>
                    <p className="text-gray-600">{selectedOrder.client_email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Дата створення</h4>
                    <p className="text-gray-700">
                      {new Date(selectedOrder.created_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Опис робіт</h4>
                  <p className="text-gray-700">{selectedOrder.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Адреса</h4>
                  <p className="text-gray-700">{selectedOrder.address}</p>
                </div>

                {selectedOrder.scheduled_date && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Запланована дата</h4>
                    <p className="text-gray-700">
                      {new Date(selectedOrder.scheduled_date).toLocaleDateString('uk-UA')}
                    </p>
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
                          <span className="text-gray-600">Робота</span>
                          <span>{selectedOrder.work_hours} год × {selectedOrder.hourly_rate} ₴</span>
                        </div>
                      )}
                      {selectedOrder.transport_km && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Транспорт</span>
                          <span>{selectedOrder.transport_km} км × {selectedOrder.transport_rate} ₴</span>
                        </div>
                      )}
                      {selectedOrder.materials_cost && Number(selectedOrder.materials_cost) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Матеріали</span>
                          <span>{Number(selectedOrder.materials_cost).toLocaleString()} ₴</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>ВСЬОГО</span>
                        <span className="text-green-600">{Number(selectedOrder.total_amount).toLocaleString()} ₴</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handleEdit(selectedOrder)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редагувати
                  </Button>
                </div>
              </div>
            </>
          )}

          {selectedOrder && isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle>Редагування замовлення {selectedOrder.id}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Статус</Label>
                  <Select 
                    value={editData.status} 
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Нове</SelectItem>
                      <SelectItem value="scheduled">Заплановано</SelectItem>
                      <SelectItem value="in_progress">В роботі</SelectItem>
                      <SelectItem value="completed">Виконано</SelectItem>
                      <SelectItem value="paid">Оплачено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Дата виконання</Label>
                  <Input
                    type="date"
                    value={editData.scheduled_date}
                    onChange={(e) => setEditData({ ...editData, scheduled_date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Загальна кількість годин (орієнтовно)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={editData.work_hours}
                      onChange={(e) => setEditData({ ...editData, work_hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ставка (₴/год)</Label>
                    <Input
                      type="number"
                      value={editData.hourly_rate}
                      onChange={(e) => setEditData({ ...editData, hourly_rate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Кілометраж (км)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.transport_km}
                      onChange={(e) => setEditData({ ...editData, transport_km: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Тариф (₴/км)</Label>
                    <Input
                      type="number"
                      value={editData.transport_rate}
                      onChange={(e) => setEditData({ ...editData, transport_rate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Вартість матеріалів (₴)</Label>
                  <Input
                    type="number"
                    value={editData.materials_cost}
                    onChange={(e) => setEditData({ ...editData, materials_cost: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Нотатки менеджера</Label>
                  <Textarea
                    value={editData.manager_notes}
                    onChange={(e) => setEditData({ ...editData, manager_notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Скасувати
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {isSaving ? 'Збереження...' : 'Зберегти'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}