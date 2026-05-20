import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MapPin, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientNewOrder() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
 
  const [formData, setFormData] = useState({
    description: location.state?.prefill || '', 
    address: '',
  });

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newOrderData = {
      client_id: user?.id || '',
      client_name: user?.name || '',
      client_phone: user?.phone || '',
      client_email: user?.email || '',
      description: formData.description,
      address: formData.address,
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrderData),
      });

      if (!response.ok) throw new Error('Помилка сервера');

      setIsSuccess(true);
      toast.success('Замовлення успішно створено!');
    } catch (error) {
      console.error('Помилка при створенні замовлення:', error);
      toast.error('Не вдалося створити замовлення. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Замовлення створено!</h2>
          <p className="text-gray-600 mb-6">
            Ваше замовлення прийнято в обробку. Наш менеджер зв'яжеться з вами найближчим часом.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/client/orders')}>
              Мої замовлення
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setIsSuccess(false);
                setFormData({ description: '', address: '' });
              }}
            >
              Створити ще
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/client/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Нове замовлення</h1>
          <p className="text-gray-600">Опишіть роботи, які потрібно виконати</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Деталі замовлення</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">
                <FileText className="h-4 w-4 inline mr-2" />
                Опис робіт
              </Label>
              <Textarea
                id="description"
                placeholder="Опишіть детально, які роботи потрібно виконати..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="h-4 w-4 inline mr-2" />
                Адреса об'єкта
              </Label>
              <Input
                id="address"
                placeholder="вул. Садова 15, с. Гнідин"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                Після відправки замовлення наш менеджер зв'яжеться з вами для уточнення деталей та призначення дати виконання робіт.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/client/orders')}
              >
                Скасувати
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Відправка...' : 'Відправити замовлення'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}