import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import type { Service, PortfolioItem } from '@/types';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [servicesRes, portfolioRes] = await Promise.all([
          fetch('http://localhost:5000/api/services'),
          fetch('http://localhost:5000/api/portfolio')
        ]);
        
        if (servicesRes.ok && portfolioRes.ok) {
          const sData = await servicesRes.json();
          const pData = await portfolioRes.json();
          setServices(sData.slice(0, 3)); // беремо перші 3 послуги
          setPortfolio(pData.slice(0, 2)); // беремо перші 2 проєкти
        }
      } catch (error) {
        console.error('Помилка завантаження публічних даних:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-green-950 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200')] bg-cover bg-center" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-800 text-green-200">
            <Sparkles className="h-3 w-3" /> Студія ландшафтного дизайну преміум-класу
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Створюємо сади, в яких <span className="text-green-400">хочеться жити</span>
          </h1>
          <p className="text-lg sm:text-xl text-green-100 max-w-3xl mx-auto">
            Terraforma пропонує повний спектр послуг з ландшафтного проєктування, озеленення, автоматичного поливу та регулярного догляду за вашою ділянкою.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/services">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-medium h-12 px-6">
                Наші послуги <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-medium h-12 px-6">
                Стати клієнтом
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Advantages */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Чому обирають Terraforma?</h2>
          <p className="text-gray-600 mt-2">Ми об'єднали європейські стандарти архітектури та автоматизований контроль якості робіт.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="p-6 bg-gray-50 rounded-xl space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0"><CheckCircle2 className="text-green-700 h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-gray-900">Власний контроль часу</h3>
            <p className="text-gray-600 text-sm">Кожен наш майстер особисто звітує про кожну відпрацьовану хвилину через внутрішню CRM.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0"><CheckCircle2 className="text-green-700 h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-gray-900">Прозора фінансова звітність</h3>
            <p className="text-gray-600 text-sm">Ви отримуєте детальний звіт вартості робіт, транспорту та матеріалів для кожного рахунку.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0"><CheckCircle2 className="text-green-700 h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-gray-900">Командний підхід</h3>
            <p className="text-gray-600 text-sm">На складні об'єкти ми призначаємо бригади з кількох профільних виконавців одночасно.</p>
          </div>
        </div>
      </section>

      {/* Dynamic Previews */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-700 h-8 w-8" /></div>
      ) : (
        <>
          {/* Services Teaser */}
          {services.length > 0 && (
            <section className="bg-gray-50 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Популярні послуги</h2>
                    <p className="text-gray-600 mt-1">Ознайомтеся з базовими пропозиціями нашої студії.</p>
                  </div>
                  <Link to="/services" className="text-green-700 hover:text-green-800 font-semibold flex items-center text-sm">
                    Усі послуги <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {services.map(s => (
                    <Card key={s.id} className="overflow-hidden bg-white border-none shadow-sm rounded-xl">
                      <div className="h-48"><img src={s.image} alt={s.name} className="w-full h-full object-cover" /></div>
                      <CardContent className="p-5">
                        <h4 className="font-bold text-lg mb-1">{s.name}</h4>
                        <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider">{s.category}</p>
                        <p className="text-green-700 font-bold">{s.price} ₴ <span className="text-gray-400 text-xs font-normal">/{s.unit}</span></p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Portfolio Teaser */}
          {portfolio.length > 0 && (
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Останні роботи</h2>
                  <p className="text-gray-600 mt-1">Пишаємося кожним створеним квадратним метром.</p>
                </div>
                <Link to="/portfolio" className="text-green-700 hover:text-green-800 font-semibold flex items-center text-sm">
                  Дивитись портфоліо <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {portfolio.map(p => {
                  const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                  return (
                    <div key={p.id} className="group relative rounded-xl overflow-hidden h-72 shadow-sm">
                      <img src={images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                        <span className="text-xs text-green-300 font-medium mb-1">{p.category}</span>
                        <h4 className="text-xl font-bold">{p.title}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}