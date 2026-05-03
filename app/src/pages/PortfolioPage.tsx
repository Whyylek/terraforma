import { useState } from 'react';
import { mockPortfolio } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortfolioPage() {
  const [selectedProject, setSelectedProject] = useState<typeof mockPortfolio[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = Array.from(new Set(mockPortfolio.map(p => p.category)));

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  const openProject = (project: typeof mockPortfolio[0]) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Наше портфоліо</h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Перегляньте приклади виконаних проєктів та переконайтесь у нашій професійності
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer bg-green-600 text-white">
            Всі проєкти
          </Badge>
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant="outline" 
              className="px-4 py-2 text-sm cursor-pointer hover:bg-green-50"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPortfolio.map((project) => (
            <div 
              key={project.id} 
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
              onClick={() => openProject(project)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.images[0]} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-green-600 text-white mb-2">
                      {project.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(project.completed_date).toLocaleDateString('uk-UA')}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.services.length} послуг
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '500+', label: 'Виконаних проєктів' },
            { value: '50+', label: 'Видів рослин' },
            { value: '15', label: 'Років досвіду' },
            { value: '98%', label: 'Задоволених клієнтів' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              
              {/* Image Gallery */}
              <div className="relative mb-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={selectedProject.images[currentImageIndex]} 
                    alt={`${selectedProject.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProject.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {selectedProject.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Project Info */}
              <div className="space-y-6">
                <div>
                  <Badge className="bg-green-600 text-white mb-3">
                    {selectedProject.category}
                  </Badge>
                  <p className="text-gray-700">{selectedProject.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Дата виконання</h4>
                    <p className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      {new Date(selectedProject.completed_date).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Виконані послуги</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-green-600 border-green-200">
                          {service}
                        </Badge>
                      ))}
                    </div>
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
