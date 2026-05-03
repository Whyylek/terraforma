import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Вхід виконано успішно!');
        // Redirect based on role
        const user = JSON.parse(localStorage.getItem('greenspace_user') || '{}');
        switch (user.role) {
          case 'client':
            navigate('/client');
            break;
          case 'worker':
            navigate('/worker');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      } else {
        setError('Невірний email або пароль');
      }
    } catch (err) {
      setError('Сталася помилка. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts info
  const demoAccounts = [
    { role: 'Клієнт', email: 'client1@gmail.com', password: 'будь-який' },
    { role: 'Працівник', email: 'ivan.worker@greenspace.ua', password: 'будь-який' },
    { role: 'Адмін', email: 'admin@greenspace.ua', password: 'будь-який' },
  ];

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
              <CardTitle className="text-2xl text-center">Вхід в систему</CardTitle>
              <CardDescription className="text-center">
                Введіть свої дані для входу в особистий кабінет
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  {isLoading ? 'Вхід...' : 'Увійти'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Ще не маєте облікового запису?{' '}
                  <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                    Зареєструватися
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Демо-акаунти для тестування</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {demoAccounts.map((account, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-green-50"
                    onClick={() => setFormData({ email: account.email, password: 'password' })}
                  >
                    <span className="font-medium">{account.role}:</span>
                    <span className="text-gray-600">{account.email}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Натисніть на акаунт, щоб автоматично заповнити поля
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
