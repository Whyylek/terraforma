import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock, MapPin, TrendingUp, Calendar, CheckCircle, Clock3, Loader2 } from 'lucide-react';
import type { WorkLog, SalaryRecord } from '@/types';
import { toast } from 'sonner';

export default function WorkerSalary() {
  const { user } = useAuth();
  
  const [workerLogs, setWorkerLogs] = useState<WorkLog[]>([]);
  const [workerSalaries, setWorkerSalaries] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [logsRes, salariesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/work-logs/worker/${user.id}`),
          fetch(`http://localhost:5000/api/salary-records/worker/${user.id}`)
        ]);

        if (!logsRes.ok || !salariesRes.ok) throw new Error('Помилка завантаження даних');

        setWorkerLogs(await logsRes.json());
        setWorkerSalaries(await salariesRes.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити дані про зарплату');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);
  
  const hourlyRate = user?.salary_hourly_rate || 0;
  const kmRate = 15; 

  const totalHours = workerLogs.reduce((sum, log) => sum + Number(log.actual_hours), 0);
  const totalKm = workerLogs.reduce((sum, log) => sum + Number(log.km_driven), 0);
  const workEarnings = totalHours * hourlyRate;
  const transportEarnings = totalKm * kmRate;
  const totalEarnings = workEarnings + transportEarnings;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Зарплата</h1>
        <p className="text-gray-600">Переглядайте свій заробіток та виплати</p>
      </div>

      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 text-sm">Орієнтовно за всі зміни</p>
              <h2 className="text-3xl font-bold">{totalEarnings.toLocaleString()} ₴</h2>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Wallet className="h-10 w-10" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-green-100 text-sm">Робота</p>
              <p className="text-xl font-semibold">{workEarnings.toLocaleString()} ₴</p>
              <p className="text-green-200 text-xs">{totalHours} год × {hourlyRate} ₴</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Транспорт</p>
              <p className="text-xl font-semibold">{transportEarnings.toLocaleString()} ₴</p>
              <p className="text-green-200 text-xs">{totalKm} км × {kmRate} ₴</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{totalHours}</p><p className="text-sm text-gray-600">Годин</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{totalKm}</p><p className="text-sm text-gray-600">Кілометрів</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{hourlyRate}</p><p className="text-sm text-gray-600">₴/година</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Wallet className="h-6 w-6 text-amber-600 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{kmRate}</p><p className="text-sm text-gray-600">₴/км</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Деталізація по змінах</CardTitle></CardHeader>
        <CardContent>
          {workerLogs.length === 0 ? (
            <div className="text-center py-8"><Clock3 className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Ще немає даних про роботу</p></div>
          ) : (
            <div className="space-y-4">
              {workerLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg"><Calendar className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="font-medium text-gray-900">{new Date(log.date).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{log.actual_hours} год</span>
                        <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{log.km_driven} км</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{((Number(log.actual_hours) * hourlyRate) + (Number(log.km_driven) * kmRate)).toLocaleString()} ₴</p>
                    <p className="text-xs text-gray-500">{log.actual_hours}×{hourlyRate} + {log.km_driven}×{kmRate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Історія виплат</CardTitle></CardHeader>
        <CardContent>
          {workerSalaries.length === 0 ? (
            <div className="text-center py-8"><Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Ще немає виплат</p></div>
          ) : (
            <div className="space-y-4">
              {workerSalaries.map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${salary.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {salary.status === 'paid' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock3 className="h-5 w-5 text-amber-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{new Date(salary.period_start).toLocaleDateString('uk-UA', { month: 'long' })}</p>
                      <p className="text-sm text-gray-600">{new Date(salary.period_start).toLocaleDateString('uk-UA')} - {new Date(salary.period_end).toLocaleDateString('uk-UA')}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{salary.total_hours} год</span>
                        <span>{salary.total_km} км</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{Number(salary.total_amount).toLocaleString()} ₴</p>
                    <Badge className={salary.status === 'paid' ? 'bg-green-600' : 'bg-amber-600'}>{salary.status === 'paid' ? 'Виплачено' : 'Очікує'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}