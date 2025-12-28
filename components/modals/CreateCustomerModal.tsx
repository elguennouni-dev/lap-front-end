import React, { useState } from 'react';
import { Customer } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ isOpen, onClose, onCustomerCreated }) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_type: 'Entreprise',
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    tax_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newCustomer = await api.createCustomer({
        ...formData,
        created_by: currentUser?.id || 0,
      });
      
      onCustomerCreated(newCustomer);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create customer', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_type: 'Entreprise',
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'France',
      tax_id: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Nouveau Client</h2>
              <p className="text-slate-600 text-lg mt-2">Ajoutez un nouveau client à votre base de données</p>
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
                    <Icon name="business" className="h-5 w-5 text-white" />
                  </div>
                  <span>Informations Entreprise</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Type de client *
                    </label>
                    <select
                      value={formData.customer_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="Entreprise">Entreprise</option>
                      <option value="Particulier">Particulier</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Numéro de TVA
                    </label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon name="location" className="h-5 w-5 text-white" />
                  </div>
                  <span>Adresse</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="123 Rue de l'Exemple"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="75000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="person" className="h-5 w-5 text-white" />
                  </div>
                  <span>Contact Principal</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Personne à contacter
                    </label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="contact@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                    <Icon name="info" className="h-5 w-5 text-white" />
                  </div>
                  <span>Informations Supplémentaires</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-slate-200">
                    <Icon name="warning" className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Champs obligatoires</p>
                      <p className="text-sm text-slate-600">Les champs marqués d'un * sont obligatoires</p>
                    </div>
                  </div>
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
                  <span>Créer le Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;