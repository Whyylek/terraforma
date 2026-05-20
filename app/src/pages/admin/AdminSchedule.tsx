import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Schedule, Order, User } from '@/types';

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    order_id: '',
    worker_id: '',
    date: '',
    start_time: '08:00',
    notes: '',
  });

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, workersRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5000/api/schedules'),
          fetch('http://localhost:5000/api/workers'),
          fetch('http://localhost:5000/api/orders')
        ]);

        if (!scheduleRes.ok || !workersRes.ok || !ordersRes.ok) {
          throw new Error('Помилка завантаження даних');
        }

        const scheduleData = await scheduleRes.json();
        const workersData = await workersRes.json();
        const ordersData = await ordersRes.json();

        setSchedule(scheduleData);
        setWorkers(workersData);
        
        setOrders(ordersData.filter((o: Order) => o.status === 'new' || o.status === 'scheduled'));
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити дані розкладу');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

 
  const scheduleByDate = schedule.reduce((acc, item) => {
   
    const dateStr = item.date.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(item);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const sortedDates = Object.keys(scheduleByDate).sort();

  const handleAddSchedule = async () => {
    const order = orders.find(o => o.id === newSchedule.order_id);
    const worker = workers.find(w => w.id === newSchedule.worker_id);
    
    if (!order || !worker) return;
    setIsAdding(true);

    const payload = {
      order_id: newSchedule.order_id,
      worker_id: newSchedule.worker_id,
      worker_name: worker.name,
      date: newSchedule.date,
      start_time: newSchedule.start_time,
      address: order.address,
      notes: newSchedule.notes,
    };

    try {
      const response = await fetch('http://localhost:5000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Помилка при збереженні');

      const createdSchedule = await response.json();
      
  
      setSchedule([...schedule, createdSchedule]);
      
      toast.success('Зміну додано до розкладу!');
      setIsAddDialogOpen(false);
      setNewSchedule({ order_id: '', worker_id: '', date: '', start_time: '08:00', notes: '' });
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося додати зміну');
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Заплановано</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-600">В роботі</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Виконано</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Розклад</h1>
          <p className="text-gray-600">Керуйте змінами працівників</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Додати зміну
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {schedule.filter(s => s.status === 'planned').length}
            </p>
            <p className="text-sm text-gray-600">Заплановано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {schedule.filter(s => s.status === 'in_progress').length}
            </p>
            <p className="text-sm text-gray-600">В роботі</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {schedule.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Виконано</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule by Date */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Розклад порожній</p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(date).toLocaleDateString('uk-UA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduleByDate[date].map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{item.worker_name}</p>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-gray-600">{item.order_id}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {item.start_time}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.address}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додати зміну</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Замовлення</Label>
              <Select 
                value={newSchedule.order_id} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, order_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть замовлення" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Працівник</Label>
              <Select 
                value={newSchedule.worker_id} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, worker_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть працівника" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Дата</Label>
              <Input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Час початку</Label>
              <Input
                type="time"
                value={newSchedule.start_time}
                onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
              />
            </div>

            <div>
              <Label>Нотатки</Label>
              <Input
                placeholder="Інструменти, особливості..."
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1"
                disabled={isAdding}
              >
                Скасувати
              </Button>
              <Button 
                onClick={handleAddSchedule}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!newSchedule.order_id || !newSchedule.worker_id || !newSchedule.date || isAdding}
              >
                {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isAdding ? 'Додаємо...' : 'Додати'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}