import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from '@/types';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services');
        if (!response.ok) throw new Error('Помилка при завантаженні даних');
        setServicesData(await response.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити список послуг');
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['all', ...Array.from(new Set(servicesData.map(s => s.category)))];

  const filteredServices = servicesData.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const services = filteredServices.filter(s => s.type === 'service');
  const products = filteredServices.filter(s => s.type === 'product');

  
  const handleOrder = (serviceName: string) => {
    if (!user) {
      toast.info('Щоб зробити замовлення, будь ласка, увійдіть в систему');
      navigate('/login');
      return;
    }
    
    if (user.role === 'client') {
    
      navigate('/client/orders/new', { state: { prefill: `Бажаємо замовити: ${serviceName}. \nУточніть деталі: ` } });
    } else {
      toast.error('Тільки клієнти можуть створювати замовлення');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Наші послуги та товари</h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Широкий вибір ландшафтних послуг та рослин для вашої ділянки
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Пошук послуг та товарів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'Всі' : category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="services" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="services">Послуги</TabsTrigger>
              <TabsTrigger value="products">Рослини</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              {services.length === 0 ? (
                <div className="text-center py-12"><p className="text-gray-500">Послуг не знайдено</p></div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="h-56 overflow-hidden">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{service.category}</span>
                        <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-3">{service.name}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-green-600">{service.price}</span>
                            <span className="text-gray-500 ml-1">₴/{service.unit}</span>
                          </div>
                          <Button onClick={() => handleOrder(service.name)} className="bg-green-600 hover:bg-green-700">
                            <ShoppingCart className="h-4 w-4 mr-2" /> Замовити
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {products.length === 0 ? (
                <div className="text-center py-12"><p className="text-gray-500">Товарів не знайдено</p></div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="h-56 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{product.category}</span>
                        <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-3">{product.name}</h3>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-green-600">{product.price}</span>
                            <span className="text-gray-500 ml-1">₴/{product.unit}</span>
                          </div>
                          <Button onClick={() => handleOrder(product.name)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            <ShoppingCart className="h-4 w-4 mr-2" /> В замовлення
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}