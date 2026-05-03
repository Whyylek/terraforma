import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { WORKER_SECRET_CODE } from '@/data/mockData';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client' as 'client' | 'worker',
    secretCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.role === 'worker' && formData.secretCode !== WORKER_SECRET_CODE) {
      setError('Невірний секретний код для реєстрації працівника');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        secretCode: formData.secretCode,
      });

      if (success) {
        toast.success('Реєстрація успішна!');
        // Redirect based on role
        if (formData.role === 'client') {
          navigate('/client');
        } else if (formData.role === 'worker') {
          navigate('/worker');
        }
      } else {
        setError('Користувач з таким email вже існує');
      }
    } catch (err) {
      setError('Сталася помилка. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-green-600">
          <ArrowLeft className="h-5 w-5 mr-2" />
          На головну
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-green-600 p-3 rounded-xl">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">GreenSpace</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Реєстрація</CardTitle>
              <CardDescription className="text-center">
                Створіть новий обліковий запис
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Тип облікового запису</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as 'client' | 'worker' })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="client"
                        id="client"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="client"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 cursor-pointer"
                      >
                        <span className="font-semibold">Клієнт</span>
                        <span className="text-xs text-gray-500">Замовляйте послуги</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="worker"
                        id="worker"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="worker"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 cursor-pointer"
                      >
                        <span className="font-semibold">Працівник</span>
                        <span className="text-xs text-gray-500">Для співробітників</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Secret Code for Workers */}
                {formData.role === 'worker' && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      Для реєстрації працівника потрібен секретний код компанії.
                      <br />
                      <strong>Демо-код: {WORKER_SECRET_CODE}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {formData.role === 'worker' && (
                  <div className="space-y-2">
                    <Label htmlFor="secretCode">Секретний код</Label>
                    <Input
                      id="secretCode"
                      type="password"
                      placeholder="Введіть секретний код"
                      value={formData.secretCode}
                      onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                      required={formData.role === 'worker'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Повне ім'я</Label>
                  <Input
                    id="name"
                    placeholder="Іван Петренко"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+380501234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Вже маєте обліковий запис?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Увійти
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
