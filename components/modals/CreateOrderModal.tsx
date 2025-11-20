import React, { useState, useEffect } from 'react';
import { Order, Customer, Product, OrderItem, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  customers: Customer[];
  products: Product[];
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onOrderCreated, 
  customers, 
  products 
}) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    priority: 'Normale',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [orderItems, setOrderItems] = useState<Array<{
    product_id: string;
    quantity: number;
    specifications: string;
  }>>([{ product_id: '', quantity: 1, specifications: '' }]);

  const calculateTotals = () => {
    let subtotal = 0;
    orderItems.forEach(item => {
      const product = products.find(p => p.product_id === parseInt(item.product_id));
      if (product) {
        subtotal += product.unit_price * item.quantity;
      }
    });
    const taxAmount = subtotal * 0.2;
    const totalAmount = subtotal + taxAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || orderItems.some(item => !item.product_id || item.quantity <= 0)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    
    try {
      const items: Omit<OrderItem, 'order_item_id' | 'order_id' | 'created_at'>[] = orderItems.map(item => {
        const product = products.find(p => p.product_id === parseInt(item.product_id));
        if (!product) throw new Error("Product not found");
        
        return {
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
          unit_price: product.unit_price,
          total_price: product.unit_price * item.quantity,
          specifications: item.specifications,
        };
      });

      const newOrder = await api.createOrder({
        customer_id: parseInt(formData.customer_id),
        status: OrderStatus.NEW_ORDER,
        priority: formData.priority,
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        created_by: currentUser?.user_id || 0,
        assigned_designer_id: null,
        assigned_imprimeur_id: null,
        is_required: true,
        created_at: '',
        updated_at: '',
        items: []
      });


      //       const newOrder = await api.createOrder({
      //   customer_id: parseInt(formData.customer_id),
      //   status: OrderStatus.NEW_ORDER,
      //   priority: formData.priority,
      //   order_date: formData.order_date,
      //   delivery_date: formData.delivery_date,
      //   subtotal_amount: subtotal,
      //   tax_amount: taxAmount,
      //   total_amount: totalAmount,
      //   created_by: currentUser?.user_id || 0,
      //   assigned_designer_id: null,
      //   assigned_imprimeur_id: null,
      //   is_required: true,
      // });
      
      onOrderCreated(newOrder);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create order', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      priority: 'Normale',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setOrderItems([{ product_id: '', quantity: 1, specifications: '' }]);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, specifications: '' }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
  };

  const getProductPrice = (productId: string) => {
    const product = products.find(p => p.product_id === parseInt(productId));
    return product ? product.unit_price : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Nouvelle Commande</h2>
              <p className="text-slate-600 text-lg mt-2">Créez une nouvelle commande pour votre client</p>
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
                    <Icon name="person" className="h-5 w-5 text-white" />
                  </div>
                  <span>Informations Client</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Client *
                    </label>
                    <select
                      required
                      value={formData.customer_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">Sélectionner un client</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Priorité *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      >
                        <option value="Normale">Normale</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Prioritaire">Prioritaire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Date commande *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.order_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Date livraison *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.delivery_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon name="receipt" className="h-5 w-5 text-white" />
                  </div>
                  <span>Récapitulatif</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600">Sous-total:</span>
                    <span className="font-semibold text-slate-800">{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600">TVA (20%):</span>
                    <span className="font-semibold text-slate-800">{taxAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-slate-200 pt-4">
                    <span className="text-slate-800">Total:</span>
                    <span className="text-blue-600">{totalAmount.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Icon name="inventory" className="h-5 w-5 text-white" />
                    </div>
                    <span>Articles de la commande</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    <Icon name="add" className="h-5 w-5" />
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800 text-lg">Article {index + 1}</h4>
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icon name="delete" className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Produit *
                          </label>
                          <select
                            required
                            value={item.product_id}
                            onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map(product => (
                              <option key={product.product_id} value={product.product_id}>
                                {product.product_name} - {product.unit_price.toFixed(2)} €
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Quantité *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {item.product_id && (
                            <div className="bg-blue-50 rounded-xl p-3">
                              <p className="text-sm text-blue-800 font-medium">
                                Total: {(getProductPrice(item.product_id) * item.quantity).toFixed(2)} €
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Spécifications
                          </label>
                          <input
                            type="text"
                            value={item.specifications}
                            onChange={(e) => updateOrderItem(index, 'specifications', e.target.value)}
                            placeholder="Couleurs, dimensions, instructions spéciales..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <span>Créer la Commande</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;