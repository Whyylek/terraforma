import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, CreditCard, Users as UsersIcon, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, User, WorkLog } from '@/types';

export default function AdminFinances() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, workersRes, logsRes] = await Promise.all([
          fetch('http://localhost:5000/api/orders'),
          fetch('http://localhost:5000/api/workers'),
          fetch('http://localhost:5000/api/work-logs')
        ]);

        if (!ordersRes.ok || !workersRes.ok || !logsRes.ok) throw new Error('Помилка завантаження');

        setOrders(await ordersRes.json());
        setWorkers(await workersRes.json());
        setWorkLogs(await logsRes.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити фінансові дані');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

 
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const paidRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);


  const workerPayments = workers.map(worker => {
    const workerLogs = workLogs.filter(l => l.worker_id === worker.id);
    const hours = workerLogs.reduce((sum, l) => sum + Number(l.actual_hours), 0);
    const km = workerLogs.reduce((sum, l) => sum + Number(l.km_driven), 0);
    const salary = hours * Number(worker.salary_hourly_rate || 0) + km * 15;
    return { ...worker, hours, km, salary };
  });

  const totalWorkerPayments = workerPayments.reduce((sum, w) => sum + w.salary, 0);
  const totalMaterials = orders.reduce((sum, o) => sum + Number(o.materials_cost || 0), 0);
  const totalExpenses = totalWorkerPayments + totalMaterials;
  const profit = totalRevenue - totalExpenses;

  const invoices = orders.filter(o => o.total_amount);
  const pendingInvoices = invoices.filter(o => o.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Фінанси</h1>
        <p className="text-gray-600">Фінансовий огляд та рахунки</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-green-100 text-sm">Прибуток</p><p className="text-2xl font-bold">{profit.toLocaleString()} ₴</p></div>
              <div className="bg-white/20 p-3 rounded-lg"><TrendingUp className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Виручка</p><p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} ₴</p></div>
              <div className="bg-blue-100 p-3 rounded-lg"><DollarSign className="h-6 w-6 text-blue-600" /></div>
            </div>
            <div className="mt-2 flex items-center text-sm"><span className="text-green-600 font-medium">{paidRevenue.toLocaleString()} ₴</span><span className="text-gray-500 ml-1">оплачено</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Витрати</p><p className="text-2xl font-bold text-gray-900">{totalExpenses.toLocaleString()} ₴</p></div>
              <div className="bg-red-100 p-3 rounded-lg"><CreditCard className="h-6 w-6 text-red-600" /></div>
            </div>
            <div className="mt-2 flex items-center text-sm"><span className="text-gray-600">Зарплата: {totalWorkerPayments.toLocaleString()} ₴</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Очікує оплати</p><p className="text-2xl font-bold text-amber-600">{pendingRevenue.toLocaleString()} ₴</p></div>
              <div className="bg-amber-100 p-3 rounded-lg"><Clock className="h-6 w-6 text-amber-600" /></div>
            </div>
            <div className="mt-2 flex items-center text-sm"><span className="text-gray-600">{pendingInvoices.length} рахунків</span></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Рахунки</TabsTrigger>
          <TabsTrigger value="workers">Зарплати працівників</TabsTrigger>
          <TabsTrigger value="breakdown">Деталізація</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Рахунки клієнтів</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <div className="text-center py-8"><CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Ще немає рахунків</p></div>
                ) : (
                  invoices.sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0)).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${invoice.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                          <CreditCard className={`h-5 w-5 ${invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{invoice.id}</p>
                            {invoice.status === 'paid' ? <Badge className="bg-green-600">Оплачено</Badge> : <Badge variant="secondary" className="bg-amber-100 text-amber-700">Очікує</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{invoice.client_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{Number(invoice.total_amount).toLocaleString()} ₴</p>
                        <p className="text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString('uk-UA')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Зарплати працівників</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerPayments.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg"><UsersIcon className="h-5 w-5 text-purple-600" /></div>
                      <div>
                        <p className="font-medium text-gray-900">{worker.name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{worker.hours} год</span><span>{worker.km} км</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{worker.salary.toLocaleString()} ₴</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Всього до виплати:</span>
                <span className="text-2xl font-bold text-purple-600">{totalWorkerPayments.toLocaleString()} ₴</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Структура доходів</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Оплачено клієнтами</span><span className="font-bold text-green-600">{paidRevenue.toLocaleString()} ₴</span></div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Очікує оплати</span><span className="font-bold text-amber-600">{pendingRevenue.toLocaleString()} ₴</span></div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"><span className="font-semibold text-gray-900">Всього виручка</span><span className="font-bold text-green-700">{totalRevenue.toLocaleString()} ₴</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Структура витрат</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Зарплата працівників</span><span className="font-bold text-red-600">{totalWorkerPayments.toLocaleString()} ₴</span></div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Матеріали</span><span className="font-bold text-red-600">{totalMaterials.toLocaleString()} ₴</span></div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"><span className="font-semibold text-gray-900">Всього витрати</span><span className="font-bold text-red-700">{totalExpenses.toLocaleString()} ₴</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}