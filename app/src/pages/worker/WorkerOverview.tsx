import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowRight, Briefcase, Wallet, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Schedule, WorkLog } from '@/types';
import { toast } from 'sonner';

export default function WorkerOverview() {
  const { user } = useAuth();
  
  const [workerSchedule, setWorkerSchedule] = useState<Schedule[]>([]);
  const [workerLogs, setWorkerLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [schedulesRes, logsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/schedules/worker/${user.id}`),
          fetch(`http://localhost:5000/api/work-logs/worker/${user.id}`)
        ]);

        if (!schedulesRes.ok || !logsRes.ok) throw new Error('Помилка завантаження');

        setWorkerSchedule(await schedulesRes.json());
        setWorkerLogs(await logsRes.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити дані');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);
  
  const today = new Date().toISOString().split('T')[0];
  
  
  const todaySchedule = workerSchedule.find(s => s.date.split('T')[0] === today);
  
  const upcomingSchedules = workerSchedule
    .filter(s => s.date.split('T')[0] >= today && s.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const totalHours = workerLogs.reduce((sum, log) => sum + Number(log.actual_hours), 0);
  const totalKm = workerLogs.reduce((sum, log) => sum + Number(log.km_driven), 0);
  const estimatedSalary = totalHours * (user?.salary_hourly_rate || 0) + totalKm * 15;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Вітаємо, {user?.name}!</h1>
        <p className="text-gray-600">Ось огляд вашої робочої активності</p>
      </div>

      {todaySchedule ? (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Сьогоднішня робота</p>
                <h3 className="text-xl font-bold mb-2">Зміна {todaySchedule.id}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-200" />
                    {todaySchedule.start_time} - {todaySchedule.end_time || '...'}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-200" />
                    {todaySchedule.address}
                  </div>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Briefcase className="h-8 w-8" />
              </div>
            </div>
            {todaySchedule.tools_needed && todaySchedule.tools_needed.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-blue-100 mb-2">Інструменти:</p>
                <div className="flex flex-wrap gap-2">
                  {todaySchedule.tools_needed.map((tool: string, idx: number) => (
                    <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-xs">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {todaySchedule.status !== 'completed' && (
              <Link to="/worker/reports">
                <Button className="mt-4 bg-white text-blue-700 hover:bg-blue-50">
                  Подати звіт
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Сьогодні вихідний</h3>
            <p className="text-gray-500">У вас немає запланованих робіт на сьогодні</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Відпрацьовано годин</p><p className="text-2xl font-bold text-gray-900">{totalHours}</p></div><div className="bg-green-100 p-3 rounded-lg"><Clock className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Проїзд (км)</p><p className="text-2xl font-bold text-gray-900">{totalKm}</p></div><div className="bg-blue-100 p-3 rounded-lg"><MapPin className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Орієнтовна зарплата</p><p className="text-2xl font-bold text-green-600">{estimatedSalary.toLocaleString()} ₴</p></div><div className="bg-amber-100 p-3 rounded-lg"><Wallet className="h-6 w-6 text-amber-600" /></div></div></CardContent></Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Найближчі зміни</CardTitle>
          <Link to="/worker/schedule">
            <Button variant="ghost" size="sm">Весь розклад<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Немає запланованих змін</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(schedule.date).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mt-1"><Clock className="h-4 w-4 mr-1" />{schedule.start_time}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1"><MapPin className="h-4 w-4 mr-1" />{schedule.address}</div>
                    </div>
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