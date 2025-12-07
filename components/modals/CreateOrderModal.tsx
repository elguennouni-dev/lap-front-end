import React, { useState } from 'react';
import { Order, Customer, Product, OrderStatus } from '../../types';
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
    commercial: '',
    nom_propriete: '',
    zone: '',
    type_panneau: '',
    avec_logo: '',
    support: '',
    nom_a_afficher: ''
  });

  const [panneaux, setPanneaux] = useState([
    { id: Date.now(), taille_h: '', taille_v: '', contenu: [] as string[] }
  ]);

  const zones = ['R0', 'R1', 'R2', 'R3', 'R5', 'R6'];
  const typesPanneau = ['Panneau', 'Oneway'];
  const optionsContenu = [
    'Millenium', 'Galaxy', 'Aqua', 'Optimo', 'Orient', 
    'Lumi-lap', 'Platinium', 'Encastreasy', 'Azur', 
    'EasyFiche', 'Itri', 'Omega', 'Other'
  ];
  const optionsLogo = ['Avec', 'Sans'];
  const supports = ['Bois', 'Forex'];

  const handleAddPanneau = () => {
    setPanneaux([...panneaux, { id: Date.now(), taille_h: '', taille_v: '', contenu: [] }]);
  };

  const handleRemovePanneau = (id: number) => {
    setPanneaux(panneaux.filter(p => p.id !== id));
  };

  const updatePanneauDimension = (id: number, field: 'taille_h' | 'taille_v', value: string) => {
    setPanneaux(panneaux.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const togglePanneauContent = (id: number, item: string) => {
    setPanneaux(panneaux.map(p => {
      if (p.id !== id) return p;
      const exists = p.contenu.includes(item);
      return {
        ...p,
        contenu: exists 
          ? p.contenu.filter(c => c !== item)
          : [...p.contenu, item]
      };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.zone || !formData.type_panneau || !formData.avec_logo || !formData.support) {
      alert('Veuillez remplir les champs obligatoires (Zone, Type, Logo, Support)');
      return;
    }

    setLoading(true);
    
    try {
      const formattedPanneaux = panneaux.map(p => ({
        ...p,
        contenu: p.contenu.join(', ')
      }));

      const newOrder = await api.createOrder({
        customer_id: 0,
        status: OrderStatus.NEW_ORDER,
        priority: 'Normale',
        order_date: new Date().toISOString().split('T')[0],
        subtotal_amount: 0,
        tax_amount: 0,
        total_amount: 0,
        created_by: currentUser?.user_id || 0,
        assigned_designer_id: null,
        assigned_imprimeur_id: null,
        is_required: true,
        created_at: '',
        updated_at: '',
        items: [],
        commercial: formData.commercial,
        nom_propriete: formData.nom_propriete,
        zone: formData.zone,
        type_panneau: formData.type_panneau,
        avec_logo: formData.avec_logo,
        support: formData.support,
        nom_a_afficher: formData.nom_a_afficher,
        panneaux: formattedPanneaux
      });

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
      commercial: '',
      nom_propriete: '',
      zone: '',
      type_panneau: '',
      avec_logo: '',
      support: '',
      nom_a_afficher: ''
    });
    setPanneaux([{ id: Date.now(), taille_h: '', taille_v: '', contenu: [] }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nouvelle Commande</h2>
            <p className="text-slate-500 text-sm mt-1">Configuration des panneaux et informations client</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Icon name="person" className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Informations Générales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Commercial
                  </label>
                  <input
                    type="text"
                    value={formData.commercial}
                    onChange={(e) => setFormData(prev => ({ ...prev, commercial: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Optionnel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nom de propriété
                  </label>
                  <input
                    type="text"
                    value={formData.nom_propriete}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom_propriete: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Optionnel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {zones.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Type de support <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type_panneau}
                    onChange={(e) => setFormData(prev => ({ ...prev, type_panneau: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {typesPanneau.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Matériau <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.support}
                    onChange={(e) => setFormData(prev => ({ ...prev, support: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {supports.map(support => (
                      <option key={support} value={support}>{support}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Icon name="inventory" className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Configuration des Panneaux</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddPanneau}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium shadow-sm"
                >
                  <Icon name="add" className="h-4 w-4" />
                  <span>Ajouter un panneau</span>
                </button>
              </div>

              <div className="space-y-4">
                {panneaux.map((panneau, index) => (
                  <div key={panneau.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative group animate-fade-in-up">
                    <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleRemovePanneau(panneau.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer ce panneau"
                      >
                        <Icon name="delete" className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center mr-2 border border-slate-200">
                        {index + 1}
                      </span>
                      Panneau #{index + 1}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Dimensions (cm)
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={panneau.taille_h}
                                onChange={(e) => updatePanneauDimension(panneau.id, 'taille_h', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Larg."
                              />
                              <span className="absolute right-3 top-2 text-xs text-slate-400">H</span>
                            </div>
                            <span className="text-slate-400">×</span>
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={panneau.taille_v}
                                onChange={(e) => updatePanneauDimension(panneau.id, 'taille_v', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Haut."
                              />
                              <span className="absolute right-3 top-2 text-xs text-slate-400">V</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-8">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Contenu & Finitions
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {optionsContenu.map((option) => {
                            const isSelected = panneau.contenu.includes(option);
                            return (
                              <label 
                                key={option}
                                className={`
                                  relative flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer select-none text-sm transition-all duration-200
                                  ${isSelected 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                                  }
                                `}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePanneauContent(panneau.id, option)}
                                  className="absolute opacity-0 w-0 h-0"
                                />
                                <span className="truncate font-medium">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {panneaux.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                    <Icon name="inventory" className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Aucun panneau configuré.</p>
                    <button
                      type="button"
                      onClick={handleAddPanneau}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Ajouter le premier panneau
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Icon name="design" className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Identité Visuelle</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Logo / Marquage <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    {optionsLogo.map(option => (
                      <label key={option} className="flex items-center cursor-pointer group">
                        <div className={`
                          w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors
                          ${formData.avec_logo === option ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}
                        `}>
                          {formData.avec_logo === option && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="logo_option"
                          value={option}
                          checked={formData.avec_logo === option}
                          onChange={(e) => setFormData(prev => ({ ...prev, avec_logo: e.target.value }))}
                          className="hidden"
                        />
                        <span className="text-slate-700 font-medium">{option} Logo</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Texte à afficher
                  </label>
                  <input
                    type="text"
                    value={formData.nom_a_afficher}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom_a_afficher: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Optionnel"
                  />
                </div>

                {formData.avec_logo === 'Avec' && (
                  <div className="md:col-span-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Fichier Logo
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Icon name="cloud-upload" className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-slate-600 font-medium mb-1">Cliquez pour importer le logo</p>
                      <p className="text-slate-400 text-xs">SVG, PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </form>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-semibold text-sm transition-colors rounded-lg hover:bg-slate-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4" />
                <span>Confirmer la commande</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;