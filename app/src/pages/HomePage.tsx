import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { mockPortfolio, mockServices } from '@/data/mockData';

export default function HomePage() {
  const featuredServices = mockServices.slice(0, 4);
  const featuredPortfolio = mockPortfolio.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Leaf className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium">Професійний ландшафтний дизайн</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Створюємо зелені оази для вашого життя
              </h1>
              <p className="text-lg lg:text-xl text-green-100 max-w-xl">
                GreenSpace — це сучасна платформа для автоматизації ландшафтних робіт. 
                Замовляйте послуги онлайн, відстежуйте прогрес та отримуйте прозорі рахунки.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services">
                  <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 w-full sm:w-auto">
                    Переглянути послуги
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Зареєструватися
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>500+ виконаних проєктів</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Гарантія якості</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800" 
                  alt="Landscape Design" 
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Чому обирають GreenSpace?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ми поєднуємо професійний підхід до ландшафтного дизайну з сучасними технологіями
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Онлайн планування',
                description: 'Переглядайте доступні дати та бронюйте послуги через інтерактивний календар',
              },
              {
                icon: Users,
                title: 'Професійна команда',
                description: 'Досвідчені фахівці з гарантованою якістю виконання робіт',
              },
              {
                icon: TrendingUp,
                title: 'Прозорі ціни',
                description: 'Детальний розрахунок вартості: робота, матеріали, транспорт',
              },
              {
                icon: CheckCircle,
                title: 'Відстеження статусу',
                description: 'Слідкуйте за прогресом вашого замовлення в реальному часі',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
                  <feature.icon className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Наші послуги</h2>
              <p className="text-lg text-gray-600">Широкий спектр ландшафтних робіт та рослин</p>
            </div>
            <Link to="/services" className="hidden sm:flex items-center text-green-600 hover:text-green-700 font-medium">
              Всі послуги
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">{service.price} ₴</span>
                    <span className="text-sm text-gray-500">/{service.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/services">
              <Button variant="outline">Всі послуги</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Наші роботи</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Перегляньте приклади виконаних проєктів та переконайтесь у нашій якості
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPortfolio.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs font-medium text-green-300 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{item.title}</h3>
                    <p className="text-gray-300 text-sm mt-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/portfolio">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Переглянути портфоліо
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Як це працює?</h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Простий процес від замовлення до виконання роботи
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Реєстрація',
                description: 'Створіть обліковий запис як клієнт за кілька хвилин',
              },
              {
                step: '02',
                title: 'Замовлення',
                description: 'Оберіть послуги та створіть заявку з описом робіт',
              },
              {
                step: '03',
                title: 'Планування',
                description: 'Адміністратор призначить дату та бригаду',
              },
              {
                step: '04',
                title: 'Виконання',
                description: 'Отримайте готову роботу та детальний рахунок',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-green-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 lg:p-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Зв'яжіться з нами</h2>
                <p className="text-gray-600 mb-8">
                  Маєте питання? Наші фахівці завжди готові допомогти вам з вибором послуг та консультацією.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Телефон</h4>
                      <p className="text-gray-600">+38 (050) 123-45-67</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Адреса</h4>
                      <p className="text-gray-600">м. Київ, вул. Садова 25</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Графік роботи</h4>
                      <p className="text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800" 
                  alt="Contact" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-white">GreenSpace</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Сучасна платформа для автоматизації ландшафтних робіт. 
                Професійний підхід до кожного проєкту.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Навігація</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-green-400 transition-colors">Головна</Link></li>
                <li><Link to="/services" className="hover:text-green-400 transition-colors">Послуги</Link></li>
                <li><Link to="/portfolio" className="hover:text-green-400 transition-colors">Портфоліо</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Кабінет</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-green-400 transition-colors">Увійти</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Реєстрація</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            © 2024 GreenSpace. Всі права захищені.
          </div>
        </div>
      </footer>
    </div>
  );
}
