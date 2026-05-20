import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, CreditCard, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/types';

export default function ClientInvoices() {
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/orders/client/${user.id}`);
        if (!response.ok) throw new Error('Помилка при завантаженні');
        setUserOrders(await response.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити рахунки');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserOrders();
  }, [user?.id]);
  
  const invoices = userOrders.filter(o => o.total_amount);
  const paidInvoices = invoices.filter(o => o.status === 'paid');
  const pendingInvoices = invoices.filter(o => o.status === 'completed');

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Очікує оплати</Badge>;
    if (status === 'paid') return <Badge className="bg-green-600">Оплачено</Badge>;
    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 text-green-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Рахунки</h1><p className="text-gray-600">Переглядайте та оплачуйте рахунки</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Всього рахунків</p><p className="text-2xl font-bold text-gray-900">{invoices.length}</p></div><div className="bg-blue-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Оплачено</p><p className="text-2xl font-bold text-green-600">{paidInvoices.length}</p></div><div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Очікує оплати</p><p className="text-2xl font-bold text-amber-600">{pendingInvoices.reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toLocaleString()} ₴</p></div><div className="bg-amber-100 p-3 rounded-lg"><Clock className="h-6 w-6 text-amber-600" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Список рахунків</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8"><FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Ще немає рахунків</p></div>
          ) : (
            <div className="space-y-4">
              {invoices.sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0)).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${invoice.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}><FileText className={`h-5 w-5 ${invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`} /></div>
                    <div><div className="flex items-center space-x-2"><p className="font-medium text-gray-900">Рахунок до {invoice.id}</p>{getStatusBadge(invoice.status)}</div><p className="text-sm text-gray-600 mt-1 line-clamp-1">{invoice.description}</p></div>
                  </div>
                  <div className="text-right"><p className="text-xl font-bold text-gray-900">{Number(invoice.total_amount).toLocaleString()} ₴</p><p className="text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString('uk-UA')}</p></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          {selectedInvoice && (
            <>
              <DialogHeader><DialogTitle className="flex items-center justify-between"><span>Рахунок до {selectedInvoice.id}</span>{getStatusBadge(selectedInvoice.status)}</DialogTitle></DialogHeader>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Клієнт:</span><p className="font-medium">{selectedInvoice.client_name}</p></div>
                  <div><span className="text-gray-500">Дата:</span><p className="font-medium">{new Date(selectedInvoice.created_at).toLocaleDateString('uk-UA')}</p></div>
                  <div><span className="text-gray-500">Адреса:</span><p className="font-medium">{selectedInvoice.address}</p></div>
                </div>
                <div className="border-t pt-4"><h4 className="font-semibold text-gray-900 mb-2">Опис робіт</h4><p className="text-gray-700">{selectedInvoice.description}</p></div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Деталізація</h4>
                  <div className="space-y-2">
                    {selectedInvoice.work_hours && (<div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Робота</span><span className="text-gray-900">{selectedInvoice.work_hours} год × {selectedInvoice.hourly_rate} ₴</span></div>)}
                    {selectedInvoice.transport_km && (<div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Транспорт</span><span className="text-gray-900">{selectedInvoice.transport_km} км × {selectedInvoice.transport_rate} ₴</span></div>)}
                    {selectedInvoice.materials_cost && Number(selectedInvoice.materials_cost) > 0 && (<div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Матеріали</span><span className="text-gray-900">{Number(selectedInvoice.materials_cost).toLocaleString()} ₴</span></div>)}
                    <div className="flex justify-between py-3 text-lg font-bold"><span>ВСЬОГО</span><span className="text-green-600">{Number(selectedInvoice.total_amount).toLocaleString()} ₴</span></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}