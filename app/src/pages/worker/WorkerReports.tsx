import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  Clock, 
  MapPin, 
  CheckCircle,
  Calendar,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Schedule, WorkLog } from '@/types';

export default function WorkerReports() {
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [reportData, setReportData] = useState({
    actual_hours: '',
    km_driven: '',
    notes: '',
  });

  const [workerSchedule, setWorkerSchedule] = useState<Schedule[]>([]);
  const [workerLogs, setWorkerLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const [schedulesRes, logsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/schedules/worker/${user.id}`),
        fetch(`http://localhost:5000/api/work-logs/worker/${user.id}`)
      ]);

      if (!schedulesRes.ok || !logsRes.ok) throw new Error('Помилка завантаження даних');

      setWorkerSchedule(await schedulesRes.json());
      setWorkerLogs(await logsRes.json());
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  };

  
  const pendingReports = workerSchedule.filter(s => s.status !== 'completed');
  const submittedReports = workerLogs;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !user?.id) return;
    setIsSubmitting(true);

    const payload = {
      schedule_id: selectedSchedule.id,
      worker_id: user.id,
      order_id: selectedSchedule.order_id,
      date: selectedSchedule.date,
      actual_hours: parseFloat(reportData.actual_hours),
      km_driven: parseFloat(reportData.km_driven),
      notes: reportData.notes,
    };

    try {
      const response = await fetch('http://localhost:5000/api/work-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Помилка сервера');

      toast.success('Звіт успішно подано!');
      setSelectedSchedule(null);
      setReportData({ actual_hours: '', km_driven: '', notes: '' });
      
      
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося подати звіт');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Звіти</h1>
        <p className="text-gray-600">Кожен працівник подає звіт про власні відпрацьовані години</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
            Очікують звіту
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">Всі звіти подано</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(schedule.date).toLocaleDateString('uk-UA', { 
                          weekday: 'long', day: 'numeric', month: 'long' 
                        })}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {schedule.start_time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {schedule.address}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedSchedule(schedule)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Подати звіт
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSchedule && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Подання звіту</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-gray-900">Зміна {selectedSchedule.id}</p>
                <p className="text-sm text-gray-600">{selectedSchedule.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actual_hours">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Ваші відпрацьовані години
                  </Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Наприклад: 8"
                    value={reportData.actual_hours}
                    onChange={(e) => setReportData({ ...reportData, actual_hours: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="km_driven">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Кілометраж (км)
                  </Label>
                  <Input
                    id="km_driven"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Наприклад: 25"
                    value={reportData.km_driven}
                    onChange={(e) => setReportData({ ...reportData, km_driven: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Нотатки щодо виконаної роботи</Label>
                <Textarea
                  id="notes"
                  placeholder="Опишіть, що було зроблено..."
                  value={reportData.notes}
                  onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setSelectedSchedule(null)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Скасувати
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Подати звіт
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Подані звіти
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submittedReports.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Ще немає поданих звітів</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedReports.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(log.date).toLocaleDateString('uk-UA', { 
                          weekday: 'long', day: 'numeric', month: 'long' 
                        })}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {log.actual_hours} год
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {log.km_driven} км
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-2">{log.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-600">Подано</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}