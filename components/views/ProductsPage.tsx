// import React, { useState, useEffect } from 'react';
// import { Product } from '../../types';
// import { api } from '../../services/api';
// import { useAppContext } from '../../contexts/AppContext';
// import { Icon } from '../common/Icon';
// import CreateProductModal from '../modals/CreateProductModal';

// const ProductsPage: React.FC = () => {
//   const { currentUser } = useAppContext();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('ALL');
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const data = await api.getProducts();
//       setProducts(data);
//     } catch (error) {
//       console.error('Failed to fetch products', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          product.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleProductCreated = (newProduct: Product) => {
//     fetchProducts();
//   };

//   const handleDeleteProduct = async (productId: number) => {
//     if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
//       setLoading(true);
//       try {
//         await api.deleteProduct(productId);
//         await fetchProducts();
//       } catch (error) {
//         console.error('Failed to delete product', error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (loading && products.length === 0) {
//     return (
//       <div className="flex justify-center items-center min-h-96">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-slate-600 text-lg">Chargement des produits...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//         <div className="space-y-2">
//           <h1 className="text-3xl font-bold text-slate-800">Produits</h1>
//           <p className="text-slate-600 text-lg">Gestion du catalogue produits</p>
//         </div>
//         <button 
//           onClick={() => setShowCreateModal(true)}
//           className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
//         >
//           <Icon name="add" className="h-5 w-5" />
//           <span className="text-lg">Nouveau Produit</span>
//         </button>
//       </div>

//       {/* Stats and Filters Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
//         <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-white/20 rounded-xl">
//               <Icon name="analytics" className="h-6 w-6" />
//             </div>
//             <h3 className="text-lg font-semibold">Aperçu</h3>
//           </div>
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-blue-100">Total produits</span>
//               <span className="text-xl font-bold">{products.length}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-blue-100">Produits actifs</span>
//               <span className="text-xl font-bold">
//                 {products.filter(p => p.is_active).length}
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-blue-100">Catégories</span>
//               <span className="text-xl font-bold">
//                 {new Set(products.map(p => p.category).filter(Boolean)).size}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl border border-slate-200 p-6">
//           <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
//             <Icon name="category" className="h-5 w-5 text-slate-600" />
//             <span>Catégories</span>
//           </h3>
//           <div className="space-y-2 max-h-32 overflow-y-auto">
//             {categories.filter(cat => cat !== 'ALL').map(category => (
//               <button
//                 key={category}
//                 onClick={() => setSelectedCategory(category)}
//                 className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
//                   selectedCategory === category 
//                     ? 'bg-blue-50 text-blue-600 border border-blue-200' 
//                     : 'hover:bg-slate-50 text-slate-700'
//                 }`}
//               >
//                 <span className="font-medium text-sm">{category}</span>
//                 <span className={`px-2 py-1 rounded-full text-xs ${
//                   selectedCategory === category 
//                     ? 'bg-blue-100 text-blue-600' 
//                     : 'bg-slate-100 text-slate-600'
//                 }`}>
//                   {products.filter(p => p.category === category).length}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>

//       {/* Products Table */}
//       <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//         <div className="p-6 border-b border-slate-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-slate-800">Liste des Produits</h2>
//             <div className="text-slate-600 font-medium">
//               {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Produit</th>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Code</th>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Catégorie</th>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Type</th>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Statut</th>
//                 <th className="text-left p-6 font-semibold text-slate-800 text-lg">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {filteredProducts.map(product => (
//                 <tr key={product.product_id} className="hover:bg-slate-50/50 transition-colors group">
//                   <td className="p-6">
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
//                         <Icon name="inventory" className="h-6 w-6 text-white" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-800 text-lg">{product.product_name}</p>
//                         {product.description && (
//                           <p className="text-sm text-slate-600 truncate max-w-xs">
//                             {product.description}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="p-6">
//                     <span className="text-slate-700 font-medium">{product.product_code || '-'}</span>
//                   </td>
//                   <td className="p-6">
//                     <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
//                       {product.category}
//                     </span>
//                   </td>
//                   <td className="p-6">
//                     <span className="font-semibold text-slate-800 text-lg">
//                       {product.product_type || 'Standard'}
//                     </span>
//                   </td>
//                   <td className="p-6">
//                     <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
//                       product.is_active 
//                         ? 'bg-green-100 text-green-700 border border-green-200' 
//                         : 'bg-red-100 text-red-700 border border-red-200'
//                     }`}>
//                       <div className={`w-2 h-2 rounded-full mr-2 ${
//                         product.is_active ? 'bg-green-500' : 'bg-red-500'
//                       }`}></div>
//                       {product.is_active ? 'Actif' : 'Inactif'}
//                     </span>
//                   </td>
//                   <td className="p-6">
//                     <div className="flex items-center space-x-2">
//                       <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
//                         <Icon name="edit" className="h-5 w-5" />
//                       </button>
//                       <button 
//                         onClick={() => handleDeleteProduct(product.product_id)}
//                         disabled={loading}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
//                       >
//                         <Icon name="delete" className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredProducts.length === 0 && (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
//               <Icon name="inventory" className="h-10 w-10 text-slate-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-slate-800 mb-3">Aucun produit trouvé</h3>
//             <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
//               {searchTerm || selectedCategory !== 'ALL' 
//                 ? "Aucun produit ne correspond à vos critères de recherche."
//                 : "Commencez par ajouter votre premier produit au catalogue."
//               }
//             </p>
//             <button 
//               onClick={() => setShowCreateModal(true)}
//               className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
//             >
//               <Icon name="add" className="h-5 w-5" />
//               <span>Ajouter un Produit</span>
//             </button>
//           </div>
//         )}
//       </div>

//       <CreateProductModal 
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onProductCreated={handleProductCreated}
//       />
//     </div>
//   );
// };

// export default ProductsPage;