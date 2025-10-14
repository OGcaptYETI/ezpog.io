import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getProductsByOrganization, createProduct, updateProduct, deleteProduct, ProductFormData } from '@/services/firestore/products';
import type { Product } from '@/types';
import { Package, Plus, Search, Grid3x3, List, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ProductModal } from '@/components/products/ProductModal';

type ViewMode = 'grid' | 'list';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    segment: '',
    status: '' as '' | 'active' | 'inactive' | 'discontinued',
  });

  useEffect(() => {
    if (user?.organizationId) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  async function loadProducts() {
    if (!user?.organizationId) return;
    
    try {
      const productsData = await getProductsByOrganization(
        user.organizationId,
        filters.brand || filters.category || filters.segment || filters.status
          ? {
              brand: filters.brand || undefined,
              category: filters.category || undefined,
              segment: filters.segment || undefined,
              status: filters.status || undefined,
            }
          : undefined
      );
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProduct = async (productData: ProductFormData) => {
    if (!user?.organizationId || !user.uid || !user.displayName) return;
    
    await createProduct(
      productData,
      user.organizationId,
      user.uid,
      user.displayName
    );
    await loadProducts();
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (!selectedProduct?.id) return;
    
    await updateProduct(selectedProduct.id, productData);
    await loadProducts();
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    await deleteProduct(productId);
    await loadProducts();
    setOpenMenuId(null);
  };

  const filteredProducts = products.filter(p =>
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.upc?.includes(searchTerm) ||
    p.productId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique values for filters
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>

          {(filters.brand || filters.category || filters.status) && (
            <button
              onClick={() => {
                setFilters({ brand: '', category: '', segment: '', status: '' });
                loadProducts();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {products.length === 0 ? 'No products yet' : 'No products found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {products.length === 0 
              ? 'Add your first product to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {products.length === 0 && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' :
                    product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.status || 'active'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UPC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.productId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.upc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {openMenuId === product.id && (
                        <>
                          <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border z-[101]">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Product
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Product
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        onSave={selectedProduct ? handleUpdateProduct : handleCreateProduct}
        product={selectedProduct ? {
          productId: selectedProduct.productId,
          upc: selectedProduct.upc,
          ean: selectedProduct.ean,
          gtin: selectedProduct.gtin,
          name: selectedProduct.name,
          description: selectedProduct.description,
          brand: selectedProduct.brand,
          brandFamily: selectedProduct.brandFamily,
          manufacturer: selectedProduct.manufacturer,
          company: selectedProduct.company,
          category: selectedProduct.category,
          subCategory: selectedProduct.subCategory,
          department: selectedProduct.department,
          segment: selectedProduct.segment,
          packagingTypeId: selectedProduct.packagingTypeId,
          packagingType: selectedProduct.packagingType,
          unitSize: selectedProduct.unitSize,
          unitOfMeasure: selectedProduct.unitOfMeasure,
          unitsPerCase: selectedProduct.unitsPerCase,
          caseDimensions: selectedProduct.caseDimensions,
          weight: selectedProduct.weight,
          weightUnit: selectedProduct.weightUnit,
          retailPrice: selectedProduct.retailPrice,
          wholesalePrice: selectedProduct.wholesalePrice,
          costPrice: selectedProduct.costPrice,
          currency: selectedProduct.currency,
          imageUrl: selectedProduct.imageUrl,
          skuImageUrl: selectedProduct.skuImageUrl,
          thumbnailUrl: selectedProduct.thumbnailUrl,
          additionalImages: selectedProduct.additionalImages,
          ingredients: selectedProduct.ingredients,
          allergens: selectedProduct.allergens,
          nutritionFacts: selectedProduct.nutritionFacts,
          certifications: selectedProduct.certifications,
          warnings: selectedProduct.warnings,
          inStock: selectedProduct.inStock,
          stockLevel: selectedProduct.stockLevel,
          reorderPoint: selectedProduct.reorderPoint,
          status: selectedProduct.status,
          tags: selectedProduct.tags,
          notes: selectedProduct.notes,
          projects: selectedProduct.projects,
        } : null}
        mode={selectedProduct ? 'edit' : 'create'}
      />
    </div>
  );
}
