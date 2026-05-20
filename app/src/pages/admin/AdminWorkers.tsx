import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User as UserIcon, Mail, Phone, DollarSign, Edit, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    salary_hourly_rate: '',
    client_hourly_rate: '',
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workers');
      if (!response.ok) throw new Error('Помилка завантаження');
      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити список працівників');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (worker: User) => {
    setSelectedWorker(worker);
    setEditData({
      salary_hourly_rate: worker.salary_hourly_rate?.toString() || '',
      client_hourly_rate: worker.client_hourly_rate?.toString() || '',
    });
  };

  const handleSave = async () => {
    if (!selectedWorker) return;
    setIsSaving(true);

    const payload = {
      salary_hourly_rate: editData.salary_hourly_rate ? parseFloat(editData.salary_hourly_rate) : null,
      client_hourly_rate: editData.client_hourly_rate ? parseFloat(editData.client_hourly_rate) : null,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/workers/${selectedWorker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const updatedWorker = await response.json();

     
      setWorkers(workers.map(w => w.id === updatedWorker.id ? updatedWorker : w));
      toast.success('Ставки успішно оновлено!');
      setSelectedWorker(null);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося зберегти ставки');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  const avgSalary = workers.length ? Math.round(workers.reduce((sum, w) => sum + Number(w.salary_hourly_rate || 0), 0) / workers.length) : 0;
  const avgClient = workers.length ? Math.round(workers.reduce((sum, w) => sum + Number(w.client_hourly_rate || 0), 0) / workers.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Працівники</h1>
        <p className="text-gray-600">Керуйте ставками працівників</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{workers.length}</p><p className="text-sm text-gray-600">Всього працівників</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{avgSalary}</p><p className="text-sm text-gray-600">Середня ставка (₴/год)</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{avgClient}</p><p className="text-sm text-gray-600">Середній тариф (₴/год)</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl"><UserIcon className="h-8 w-8 text-purple-600" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1"><Mail className="h-4 w-4 mr-1" />{worker.email}</div>
                    <div className="flex items-center text-sm text-gray-600 mt-1"><Phone className="h-4 w-4 mr-1" />{worker.phone}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}><Edit className="h-5 w-5" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div><p className="text-sm text-gray-500">Ставка працівника</p><p className="text-lg font-bold text-green-600">{worker.salary_hourly_rate || 0} ₴/год</p></div>
                <div><p className="text-sm text-gray-500">Тариф для клієнта</p><p className="text-lg font-bold text-blue-600">{worker.client_hourly_rate || 0} ₴/год</p></div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Маржа:</span>
                  <span className="font-medium text-purple-600">{Number(worker.client_hourly_rate || 0) - Number(worker.salary_hourly_rate || 0)} ₴/год</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагування ставок</DialogTitle></DialogHeader>
          {selectedWorker && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl"><UserIcon className="h-8 w-8 text-purple-600" /></div>
                <div><h3 className="font-semibold text-gray-900">{selectedWorker.name}</h3><p className="text-sm text-gray-600">{selectedWorker.email}</p></div>
              </div>
              <div>
                <Label htmlFor="salary_rate"><DollarSign className="h-4 w-4 inline mr-1" />Ставка працівника (₴/год)</Label>
                <Input id="salary_rate" type="number" value={editData.salary_hourly_rate} onChange={(e) => setEditData({ ...editData, salary_hourly_rate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="client_rate"><TrendingUp className="h-4 w-4 inline mr-1" />Тариф для клієнта (₴/год)</Label>
                <Input id="client_rate" type="number" value={editData.client_hourly_rate} onChange={(e) => setEditData({ ...editData, client_hourly_rate: e.target.value })} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Маржа компанії:</span>
                  <span className="font-bold text-purple-600">
                    {(parseFloat(editData.client_hourly_rate || '0') - parseFloat(editData.salary_hourly_rate || '0')).toFixed(0)} ₴/год
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => setSelectedWorker(null)} className="flex-1" disabled={isSaving}>Скасувати</Button>
                <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Зберегти
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}