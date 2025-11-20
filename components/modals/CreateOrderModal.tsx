import React, { useState } from 'react';
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
    commercial: '',
    nom_propriete: '',
    zone: '',
    type_panneau: '',
    avec_logo: '',
    support: '',
    nom_a_afficher: ''
  });

  const [panneaux, setPanneaux] = useState([
    { taille_h: '', taille_v: '', contenu: '' },
    { taille_h: '', taille_v: '', contenu: '' },
    { taille_h: '', taille_v: '', contenu: '' },
    { taille_h: '', taille_v: '', contenu: '' },
    { taille_h: '', taille_v: '', contenu: '' },
    { taille_h: '', taille_v: '', contenu: '' }
  ]);

  const zones = ['R0', 'R1', 'R2', 'R3', 'R5', 'R6'];
  const typesPanneau = ['Panneau', 'Oneway'];
  const optionsContenu = [
    'Millenium', 'Galaxy', 'Aqua', 'Optimo', 'Orient', 
    'Lumi-lap', 'Platinium', 'Encastreasy', 'Azur', 
    'EasyFiche', 'Itri', 'Other'
  ];
  const optionsLogo = ['Avec', 'Sans'];
  const supports = ['Bois', 'Forex'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commercial || !formData.nom_propriete || !formData.zone || 
        !formData.type_panneau || !formData.avec_logo || !formData.support || 
        !formData.nom_a_afficher) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    
    try {
      const newOrder = await api.createOrder({
        customer_id: 0, // You might want to map this differently
        status: OrderStatus.NEW_ORDER,
        priority: 'Normale',
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        // Additional fields for your specific form
        commercial: formData.commercial,
        nom_propriete: formData.nom_propriete,
        zone: formData.zone,
        type_panneau: formData.type_panneau,
        avec_logo: formData.avec_logo,
        support: formData.support,
        nom_a_afficher: formData.nom_a_afficher,
        panneaux: panneaux
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
    setPanneaux([
      { taille_h: '', taille_v: '', contenu: '' },
      { taille_h: '', taille_v: '', contenu: '' },
      { taille_h: '', taille_v: '', contenu: '' },
      { taille_h: '', taille_v: '', contenu: '' },
      { taille_h: '', taille_v: '', contenu: '' },
      { taille_h: '', taille_v: '', contenu: '' }
    ]);
  };

  const updatePanneau = (index: number, field: string, value: string) => {
    const updatedPanneaux = [...panneaux];
    updatedPanneaux[index] = { ...updatedPanneaux[index], [field]: value };
    setPanneaux(updatedPanneaux);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Commande de travaux - LAP</h2>
              <p className="text-slate-600 text-lg mt-2">Nouvelle commande de travaux</p>
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
          {/* Informations de base */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Icon name="person" className="h-5 w-5 text-white" />
              </div>
              <span>Informations de base</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Commercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.commercial}
                  onChange={(e) => setFormData(prev => ({ ...prev, commercial: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Nom du commercial"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Nom de propriété *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom_propriete}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom_propriete: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Nom de la propriété"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Zone *
                </label>
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="">Sélectionner une zone</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Panneau / One Way *
                </label>
                <select
                  required
                  value={formData.type_panneau}
                  onChange={(e) => setFormData(prev => ({ ...prev, type_panneau: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="">Sélectionner un type</option>
                  {typesPanneau.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Configuration des panneaux */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="inventory" className="h-5 w-5 text-white" />
              </div>
              <span>Configuration des panneaux</span>
            </h3>

            <div className="space-y-6">
              {panneaux.map((panneau, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h4 className="font-semibold text-slate-800 text-lg">Panneau {index + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Taille Panneau {index + 1} * (Horizontal) cm
                      </label>
                      <input
                        type="number"
                        value={panneau.taille_h}
                        onChange={(e) => updatePanneau(index, 'taille_h', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Horizontal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        (Verticale) cm
                      </label>
                      <input
                        type="number"
                        value={panneau.taille_v}
                        onChange={(e) => updatePanneau(index, 'taille_v', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Verticale"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contenu Panneau {index + 1} {index === 0 && '*'}
                    </label>
                    <select
                      required={index === 0}
                      value={panneau.contenu}
                      onChange={(e) => updatePanneau(index, 'contenu', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un contenu</option>
                      {optionsContenu.map(contenu => (
                        <option key={contenu} value={contenu}>{contenu}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personnalisation */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Icon name="design" className="h-5 w-5 text-white" />
              </div>
              <span>Personnalisation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Avec ou sans LOGO/Nom *
                </label>
                <select
                  required
                  value={formData.avec_logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, avec_logo: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="">Sélectionner une option</option>
                  {optionsLogo.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Support *
                </label>
                <select
                  required
                  value={formData.support}
                  onChange={(e) => setFormData(prev => ({ ...prev, support: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="">Sélectionner un support</option>
                  {supports.map(support => (
                    <option key={support} value={support}>{support}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Nom de propriété * (Le nom à afficher sur le panneau)
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom_a_afficher}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom_a_afficher: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Nom à afficher sur le panneau"
                />
              </div>

              {formData.avec_logo === 'Avec' && (
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-slate-700 mb-3">
                    Importer Logo
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                    <Icon name="cloud-upload" className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg mb-2">
                      Upload 1 supported file: audio, document, drawing, presentation, spreadsheet, or video. Max 10 MB.
                    </p>
                    <button
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      Choisir un fichier
                    </button>
                  </div>
                </div>
              )}
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