import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle,
  Clock3,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Schedule } from '@/types';

export default function WorkerSchedule() {
  const { user } = useAuth();
  
  const [workerSchedule, setWorkerSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/schedules/worker/${user.id}`);
        if (!response.ok) throw new Error('Помилка завантаження');
        setWorkerSchedule(await response.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити розклад');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.id]);
  
  
  const upcoming = workerSchedule.filter(s => s.status === 'planned').sort((a, b) => a.date.localeCompare(b.date));
  const inProgress = workerSchedule.filter(s => s.status === 'in_progress');
  const completed = workerSchedule.filter(s => s.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));

  const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">
              {new Date(schedule.date).toLocaleDateString('uk-UA', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
            {schedule.status === 'planned' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Заплановано</Badge>
            )}
            {schedule.status === 'in_progress' && (
              <Badge className="bg-purple-600">В роботі</Badge>
            )}
            {schedule.status === 'completed' && (
              <Badge className="bg-green-600">Виконано</Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {schedule.start_time} {schedule.end_time && `- ${schedule.end_time}`}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {schedule.address}
          </div>
          
          {schedule.notes && (
            <p className="text-sm text-gray-500 mt-2">{schedule.notes}</p>
          )}
          
          {schedule.tools_needed && schedule.tools_needed.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Інструменти:</p>
              <div className="flex flex-wrap gap-1">
                {schedule.tools_needed.map((tool: string, idx: number) => (
                  <span key={idx} className="bg-white px-2 py-1 rounded text-xs text-gray-700 border">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Мій розклад</h1>
        <p className="text-gray-600">Переглядайте свої зміни та деталі робіт</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
            <p className="text-sm text-gray-600">Заплановано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{inProgress.length}</p>
            <p className="text-sm text-gray-600">В роботі</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completed.length}</p>
            <p className="text-sm text-gray-600">Виконано</p>
          </CardContent>
        </Card>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Clock3 className="h-5 w-5 mr-2" />
              В роботі зараз
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgress.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Заплановані зміни
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Немає запланованих змін</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Виконані зміни
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Ще немає виконаних змін</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completed.slice(0, 5).map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}