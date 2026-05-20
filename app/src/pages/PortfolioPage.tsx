import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Tag, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import type { PortfolioItem } from '@/types';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/portfolio');
        if (!response.ok) throw new Error('Помилка завантаження');
        setPortfolio(await response.json());
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити портфоліо');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const categories = ['all', ...Array.from(new Set(portfolio.map(item => item.category)))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-green-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Наше Портфоліо</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Реалізовані проєкти студії Terraforma — від маленьких приватних садів до масштабних паркових зон.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white p-1 border rounded-xl flex flex-wrap h-auto gap-1">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-green-700 data-[state=active]:text-white rounded-lg px-4 py-2 capitalize"
                >
                  {category === 'all' ? 'Всі проєкти' : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((cat) => {
            const filteredItems = cat === 'all' 
              ? portfolio 
              : portfolio.filter(item => item.category === cat);

            return (
              <TabsContent key={cat} value={cat}>
                {filteredItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">Проєктів у цій категорії поки немає.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {filteredItems.map((item) => {
                   
                      const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                      const services = typeof item.services === 'string' ? JSON.parse(item.services) : item.services;

                      return (
                        <Card key={item.id} className="overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-none">
                          <div className="h-64 overflow-hidden relative">
                            <img 
                              src={images?.[0] || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600'} 
                              alt={item.title} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-green-900 font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center">
                              <Award className="h-3 w-3 mr-1 text-green-600" />
                              {item.category}
                            </span>
                          </div>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(item.completed_date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })}
                              </span>
                              <span className="font-mono">ID: {item.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                            
                            <div className="pt-2">
                              <span className="text-xs font-semibold text-gray-500 block mb-2 flex items-center">
                                <Tag className="h-3 w-3 mr-1" /> Виконані роботи:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {services?.map((service: string, i: number) => (
                                  <span key={i} className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-md border border-green-100">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}