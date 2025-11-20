import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import CreateCustomerModal from '../modals/CreateCustomerModal';

const CustomersPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerCreated = (newCustomer: Customer) => {
    fetchCustomers();
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setLoading(true);
      try {
        await api.deleteCustomer(customerId);
        await fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 text-lg">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-600 text-lg">Gestion des clients et entreprises partenaires</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          <Icon name="add" className="h-5 w-5" />
          <span className="text-lg">Nouveau Client</span>
        </button>
      </div>

      {/* Aperçu Section - Vertical Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Icon name="analytics" className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Aperçu</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Total clients</span>
              <span className="text-xl font-bold">{customers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Entreprises</span>
              <span className="text-xl font-bold">
                {customers.filter(c => c.customer_type === 'Entreprise').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Particuliers</span>
              <span className="text-xl font-bold">
                {customers.filter(c => c.customer_type === 'Particulier').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Icon name="filter-list" className="h-5 w-5 text-slate-600" />
            <span>Recherche</span>
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
              />
            </div>
            <div className="text-slate-600 font-medium text-center">
              {filteredCustomers.length} client{filteredCustomers.length !== 1 ? 's' : ''} trouvé{filteredCustomers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Icon name="category" className="h-5 w-5 text-slate-600" />
            <span>Types de Clients</span>
          </h3>
          <div className="space-y-2">
            {[
              { type: 'Entreprise', count: customers.filter(c => c.customer_type === 'Entreprise').length, color: 'bg-blue-100 text-blue-700' },
              { type: 'Particulier', count: customers.filter(c => c.customer_type === 'Particulier').length, color: 'bg-green-100 text-green-700' },
              { type: 'Administration', count: customers.filter(c => c.customer_type === 'Administration').length, color: 'bg-purple-100 text-purple-700' },
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between p-2">
                <span className="text-sm text-slate-700">{item.type}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Liste des Clients</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {filteredCustomers.map(customer => (
            <div key={customer.customer_id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-slate-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                    <Icon name="business" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{customer.company_name}</h3>
                    <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      {customer.customer_type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {customer.contact_name && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Icon name="person" className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{customer.contact_name}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Icon name="email" className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-slate-600 text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Icon name="phone" className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-slate-600 text-sm">{customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center space-x-2">
                  <Icon name="calendar" className="h-3 w-3" />
                  <span>Créé le {new Date(customer.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.customer_id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Icon name="delete" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon name="people" className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Aucun client trouvé</h3>
            <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
              {searchTerm 
                ? "Aucun client ne correspond à votre recherche."
                : "Commencez par ajouter votre premier client à votre base de données."
              }
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <Icon name="add" className="h-5 w-5" />
              <span>Ajouter un Client</span>
            </button>
          </div>
        )}
      </div>

      <CreateCustomerModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};

export default CustomersPage;