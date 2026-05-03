import { useState } from 'react';
import { mockUsers } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  DollarSign,
  Edit,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState(mockUsers.filter(u => u.role === 'worker'));
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null);
  const [editData, setEditData] = useState({
    salary_hourly_rate: '',
    client_hourly_rate: '',
  });

  const handleEdit = (worker: typeof workers[0]) => {
    setSelectedWorker(worker);
    setEditData({
      salary_hourly_rate: worker.salary_hourly_rate?.toString() || '',
      client_hourly_rate: worker.client_hourly_rate?.toString() || '',
    });
  };

  const handleSave = () => {
    if (!selectedWorker) return;

    const updatedWorker = {
      ...selectedWorker,
      salary_hourly_rate: parseFloat(editData.salary_hourly_rate),
      client_hourly_rate: parseFloat(editData.client_hourly_rate),
    };

    const updatedWorkers = workers.map(w => w.id === updatedWorker.id ? updatedWorker : w);
    setWorkers(updatedWorkers);

    // Update mock data
    const workerIndex = mockUsers.findIndex(u => u.id === updatedWorker.id);
    if (workerIndex >= 0) {
      mockUsers[workerIndex] = updatedWorker;
    }

    toast.success('Ставки оновлено!');
    setSelectedWorker(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Працівники</h1>
        <p className="text-gray-600">Керуйте ставками працівників</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{workers.length}</p>
            <p className="text-sm text-gray-600">Всього працівників</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {Math.round(workers.reduce((sum, w) => sum + (w.salary_hourly_rate || 0), 0) / workers.length || 0)}
            </p>
            <p className="text-sm text-gray-600">Середня ставка (₴/год)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(workers.reduce((sum, w) => sum + (w.client_hourly_rate || 0), 0) / workers.length || 0)}
            </p>
            <p className="text-sm text-gray-600">Середній тариф (₴/год)</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers List */}
      <div className="grid md:grid-cols-2 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {worker.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {worker.phone}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEdit(worker)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Ставка працівника</p>
                  <p className="text-lg font-bold text-green-600">
                    {worker.salary_hourly_rate} ₴/год
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Тариф для клієнта</p>
                  <p className="text-lg font-bold text-blue-600">
                    {worker.client_hourly_rate} ₴/год
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Маржа:</span>
                  <span className="font-medium text-purple-600">
                    {((worker.client_hourly_rate || 0) - (worker.salary_hourly_rate || 0))} ₴/год
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редагування ставок</DialogTitle>
          </DialogHeader>
          
          {selectedWorker && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedWorker.name}</h3>
                  <p className="text-sm text-gray-600">{selectedWorker.email}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="salary_rate">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Ставка працівника (₴/год)
                </Label>
                <Input
                  id="salary_rate"
                  type="number"
                  value={editData.salary_hourly_rate}
                  onChange={(e) => setEditData({ ...editData, salary_hourly_rate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="client_rate">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Тариф для клієнта (₴/год)
                </Label>
                <Input
                  id="client_rate"
                  type="number"
                  value={editData.client_hourly_rate}
                  onChange={(e) => setEditData({ ...editData, client_hourly_rate: e.target.value })}
                />
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
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setSelectedWorker(null)}
                  className="flex-1"
                >
                  Скасувати
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
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
