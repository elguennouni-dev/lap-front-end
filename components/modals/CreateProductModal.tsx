import React, { useState } from 'react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { Icon } from '../common/Icon';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onProductCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    description: '',
    category: '',
    unit_price: 0,
    tx_tva: 20,
    is_active: true,
  });

  const categories = [
    'Impression',
    'Design',
    'Packaging',
    'Signalétique',
    'Textile',
    'Papeterie',
    'Digital',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newProduct = await api.createProduct(formData);
      onProductCreated(newProduct);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create product', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_code: '',
      product_name: '',
      description: '',
      category: '',
      unit_price: 0,
      tx_tva: 20,
      is_active: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Nouveau Produit</h2>
              <p className="text-slate-600 text-lg mt-2">Ajoutez un nouveau produit au catalogue</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Icon name="close" className="h-7 w-7 text-slate-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Icon name="inventory" className="h-5 w-5 text-white" />
                  </div>
                  <span>Informations Produit</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Code produit *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.product_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="ex: IMP-001"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="ex: Flyer A4 couleur"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon name="description" className="h-5 w-5 text-white" />
                  </div>
                  <span>Description</span>
                </h3>
                
                <div>
                  <label className="block text-lg font-medium text-slate-700 mb-3">
                    Description du produit
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
                    placeholder="Description détaillée du produit..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="euro" className="h-5 w-5 text-white" />
                  </div>
                  <span>Prix et Taxes</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Prix unitaire (€) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Taux TVA (%) *
                    </label>
                    <select
                      value={formData.tx_tva}
                      onChange={(e) => setFormData(prev => ({ ...prev, tx_tva: parseFloat(e.target.value) }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="5.5">5.5%</option>
                      <option value="10">10%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>

                  {formData.unit_price > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Prix HT:</span>
                        <span className="font-semibold text-slate-800">{formData.unit_price.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">TVA ({formData.tx_tva}%):</span>
                        <span className="font-semibold text-slate-800">{(formData.unit_price * formData.tx_tva / 100).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-bold border-t border-slate-200 pt-2">
                        <span className="text-slate-800">Prix TTC:</span>
                        <span className="text-blue-600">{(formData.unit_price * (1 + formData.tx_tva / 100)).toFixed(2)} €</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                    <Icon name="settings" className="h-5 w-5 text-white" />
                  </div>
                  <span>Paramètres</span>
                </h3>
                
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-slate-200">
                  <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    formData.is_active ? 'bg-green-500' : 'bg-slate-300'
                  } relative`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      formData.is_active ? 'left-7' : 'left-1'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="is_active" className="text-lg font-medium text-slate-800 cursor-pointer">
                      Produit actif
                    </label>
                    <p className="text-slate-600 text-sm">
                      Le produit sera visible dans le catalogue
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-6 pt-8 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-slate-600 hover:text-slate-800 font-medium text-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-3 text-lg shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <Icon name="add" className="h-5 w-5" />
                  <span>Créer le Produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;