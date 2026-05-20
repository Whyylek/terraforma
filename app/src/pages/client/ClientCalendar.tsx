import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Loader2 } from 'lucide-react';
import type { Order } from '@/types';
import { toast } from 'sonner';

export default function ClientCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/orders/client/${user.id}`);
        if (!response.ok) throw new Error('Помилка завантаження');
        setUserOrders(await response.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити календар');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserOrders();
  }, [user?.id]);
  
  const scheduledOrders = userOrders.filter(o => o.scheduled_date);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
  const weekDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const getOrdersForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledOrders.filter(o => {
     
      const orderDateStr = o.scheduled_date ? o.scheduled_date.split('T')[0] : '';
      return orderDateStr === dateStr;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 text-green-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Календар</h1><p className="text-gray-600">Переглядайте заплановані роботи</p></div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const orders = getOrdersForDate(day);
                const hasOrders = orders.length > 0;
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div key={day} className={`aspect-square border rounded-lg p-2 ${isToday ? 'border-green-500 bg-green-50' : 'border-gray-200'} ${hasOrders ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                    <div className={`text-sm font-medium ${isToday ? 'text-green-700' : 'text-gray-700'}`}>{day}</div>
                    {hasOrders && (
                      <div className="mt-1">
                        {orders.map((order, idx) => (
                          <div key={idx} className={`text-xs px-1.5 py-0.5 rounded mb-1 truncate ${order.status === 'in_progress' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.id}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Заплановані роботи</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Немає запланованих робіт</p>
              ) : (
                scheduledOrders.map((order) => (
                  <div key={order.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center justify-between"><span className="font-medium text-gray-900">{order.id}</span><Badge variant={order.status === 'in_progress' ? 'default' : 'secondary'}>{order.status === 'in_progress' ? 'В роботі' : 'Заплановано'}</Badge></div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{order.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-2"><CalendarIcon className="h-4 w-4 mr-1" />{order.scheduled_date && new Date(order.scheduled_date).toLocaleDateString('uk-UA')}</div>
                    <div className="flex items-center text-sm text-gray-500 mt-1"><MapPin className="h-4 w-4 mr-1" />{order.address}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}