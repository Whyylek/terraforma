import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Lock, User, Phone, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client' as UserRole,
    secretCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Будь ласка, введіть коректний номер у форматі +380XXXXXXXXX');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'worker' && formData.secretCode !== 'GREEN2024') {
      toast.error('Невірний секретний код для реєстрації працівника!');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        toast.success('Реєстрація успішна!');
        if (formData.role === 'worker') navigate('/worker');
        else navigate('/client');
      } else {
        toast.error('Помилка реєстрації. Можливо, цей email вже зайнятий.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Сталася помилка при реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-green-900">Реєстрація у Terraforma</CardTitle>
          <CardDescription>Створіть свій профіль у системі</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Повне ім'я</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="name" 
                  placeholder="Олександр Шевченко" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10" required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Електронна пошта</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" type="email" placeholder="name@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10" required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефону</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="phone" placeholder="+380---------" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10" required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Хто ви?</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Клієнт</SelectItem>
                    <SelectItem value="worker">Працівник</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" type="password" placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10" required 
                  />
                </div>
              </div>
            </div>

            {formData.role === 'worker' && (
              <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200 animate-in fade-in duration-300">
                <Label htmlFor="secretCode" className="text-amber-800">Секретний код компанії</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input 
                    id="secretCode" type="password" placeholder="Введіть код копанії" 
                    value={formData.secretCode}
                    onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                    className="pl-10 border-amber-300 focus-visible:ring-amber-500" required 
                  />
                </div>
                <p className="text-[10px] text-amber-600 mt-1">* Для тесту використовуйте код: <span className="font-bold">GREEN2024</span></p>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Реєстрація...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Зареєструватися
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Вже є акаунт?{' '}
            <Link to="/login" className="font-medium text-green-700 hover:text-green-600 underline">
              Увійти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}