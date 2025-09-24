import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Settings, GripVertical, Eye, EyeOff } from 'lucide-react';
import { MicroplasticSource, CATEGORIES, getSourcesByCategory } from '@/lib/microplastic-sources';

interface SourceManagerProps {
  sources: MicroplasticSource[];
  onSourcesChange: (sources: MicroplasticSource[]) => void;
}

export function SourceManager({ sources, onSourcesChange }: SourceManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  const sourcesByCategory = getSourcesByCategory(sources);

  const toggleSourceEnabled = (sourceKey: string) => {
    const updatedSources = sources.map(source =>
      source.key === sourceKey ? { ...source, enabled: !source.enabled } : source
    );
    onSourcesChange(updatedSources);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // If dragging within the same category, reorder
    if (source.droppableId === destination.droppableId) {
      const category = source.droppableId;
      const categorySources = sourcesByCategory[category] || [];
      const newOrder = Array.from(categorySources);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);

      // Update the sources array
      const updatedSources = sources.map(source => {
        const newIndex = newOrder.findIndex(s => s.key === source.key);
        return newIndex !== -1 ? { ...source, order: newIndex } : source;
      });

      onSourcesChange(updatedSources);
    }
  };

  const enabledCount = sources.filter(s => s.enabled).length;
  const totalCount = sources.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Customize Input Sources</span>
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/{totalCount} enabled
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs"
        >
          {isOpen ? 'Hide' : 'Manage'} Sources
        </Button>
      </div>

      {isOpen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drag & Drop to Reorder Sources</CardTitle>
            <p className="text-xs text-gray-500">
              Click the eye icon to enable/disable sources. Drag to reorder within categories.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              {Object.entries(sourcesByCategory).map(([categoryKey, categorySources]) => {
                const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
                if (!category) return null;

                return (
                  <div key={categoryKey} className="space-y-2">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {categorySources.filter(s => s.enabled).length}/{categorySources.length}
                      </Badge>
                    </div>

                    <Droppable droppableId={categoryKey}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                            snapshot.isDraggingOver 
                              ? 'border-primary/50 bg-primary/5' 
                              : 'border-gray-200 bg-gray-50/50'
                          }`}
                        >
                          {categorySources.map((source, index) => (
                            <Draggable key={source.key} draggableId={source.key} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center space-x-3 p-3 bg-white rounded-lg border transition-all ${
                                    snapshot.isDragging 
                                      ? 'shadow-lg border-primary/50' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${!source.enabled ? 'opacity-60' : ''}`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">{source.icon}</span>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {source.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {source.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                      {source.particlesPerUnit} particles per {source.unit}
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSourceEnabled(source.key)}
                                    className={`p-2 h-8 w-8 ${
                                      source.enabled 
                                        ? 'text-green-600 hover:text-green-700' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                  >
                                    {source.enabled ? (
                                      <Eye className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </DragDropContext>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


