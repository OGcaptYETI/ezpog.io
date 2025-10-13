import { useState } from 'react';
import { Search, Package, Grid3x3, List } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Product } from '@/types/planogram';

interface ProductLibraryPanelProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export default function ProductLibraryPanel({ products, onProductSelect }: ProductLibraryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      dimensions: product.dimensions,
      facings: 1,
      x: 0,
      y: 0,
      rowIndex: 0,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Library
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            className="flex-1"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="flex-1"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs text-gray-500 mb-2">
          {filteredProducts.length} products • Drag to canvas
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, product)}
                onClick={() => onProductSelect?.(product)}
                className="bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-blue-400 hover:shadow-md transition-all"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-20 object-contain mb-2"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="text-xs font-semibold truncate">{product.name}</div>
                <div className="text-xs text-gray-500 truncate">{product.brand}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {product.dimensions.width}" × {product.dimensions.height}"
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, product)}
                onClick={() => onProductSelect?.(product)}
                className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-3"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">{product.brand}</div>
                  <div className="text-xs text-gray-400">
                    {product.dimensions.width}" × {product.dimensions.height}" × {product.dimensions.depth}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
