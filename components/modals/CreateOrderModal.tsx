import React, { useState, useRef, useEffect } from 'react';
import { Order, TypeTravaux, Zone } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  customers: any[]; 
  products: any[];  
}

// Item Interface for Local State
interface OrderItem {
  id: number;
  type: TypeTravaux;
  hauteur: string;
  largeur: string;
  contenu: string[]; 
  manuscriptText: string; 
  logoNomRequis: boolean;
  nomSaisi: string;
  autresDetails: string;
}

const OPTIONS_CONTENU = [
  'Millenium', 'Galaxy', 'Aqua', 'Optimo', 'Orient', 
  'Lumi-lap', 'Platinium', 'Encastreasy', 'Azur', 
  'EasyFiche', 'Itri', 'Omega', 'Autre'
];

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onOrderCreated 
}) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const facadeInputRef = useRef<HTMLInputElement>(null);

  // Data State
  const [zones, setZones] = useState<Zone[]>([]);
  const [nomPropriete, setNomPropriete] = useState('');
  const [zoneId, setZoneId] = useState<number | ''>('');
  
  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [facadeFile, setFacadeFile] = useState<File | null>(null);

  // Items State
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: Date.now(),
      type: TypeTravaux.PANNEAU,
      hauteur: '',
      largeur: '',
      contenu: [],
      manuscriptText: '',
      logoNomRequis: true,
      nomSaisi: '',
      autresDetails: ''
    }
  ]);

  // Fetch Zones on Mount
  useEffect(() => {
    if (isOpen) {
      const fetchZones = async () => {
        try {
          const fetchedZones = await api.getZones();
          setZones(fetchedZones);
        } catch (error) {
          console.error("Failed to fetch zones", error);
        }
      };
      fetchZones();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'facade') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'logo') setLogoFile(e.target.files[0]);
      else setFacadeFile(e.target.files[0]);
    }
  };

  // --- ITEM MANAGEMENT ---

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        type: TypeTravaux.PANNEAU,
        hauteur: '',
        largeur: '',
        contenu: [],
        manuscriptText: '',
        logoNomRequis: true,
        nomSaisi: '',
        autresDetails: ''
      }
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return; 
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleContenu = (id: number, option: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const exists = item.contenu.includes(option);
      return {
        ...item,
        contenu: exists 
          ? item.contenu.filter(c => c !== option) 
          : [...item.contenu, option]
      };
    }));
  };

  // --- SUBMISSION ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only Zone is required now
    if (!zoneId) {
      alert('Veuillez sélectionner une Zone');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        nomPropriete, // Can be empty string now
        zoneId: Number(zoneId),
        items: items.map(item => ({
            type: item.type,
            hauteur: item.type === TypeTravaux.PANNEAU ? Number(item.hauteur) : 0,
            largeur: item.type === TypeTravaux.PANNEAU ? Number(item.largeur) : 0,
            contenu: item.contenu.join(', '),
            manuscriptText: item.type === TypeTravaux.ONEWAY ? item.manuscriptText : '',
            logoNomRequis: item.logoNomRequis,
            nomSaisi: item.nomSaisi,
            autresDetails: item.autresDetails
        }))
      };

      const newOrder = await api.createOrder(
        orderData, 
        logoFile || undefined, 
        facadeFile || undefined
      );

      onOrderCreated(newOrder);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create order', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNomPropriete('');
    setZoneId('');
    setLogoFile(null);
    setFacadeFile(null);
    setItems([{
      id: Date.now(),
      type: TypeTravaux.PANNEAU,
      hauteur: '',
      largeur: '',
      contenu: [],
      manuscriptText: '',
      logoNomRequis: true,
      nomSaisi: '',
      autresDetails: ''
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nouvelle Commande</h2>
            <p className="text-slate-500 text-sm mt-1">Ajoutez un ou plusieurs panneaux à la commande</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. General Info */}
            <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Icon name="person" className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Informations Générales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nom Propriété / Client {/* Removed Asterisk */}
                  </label>
                  <input
                    type="text"
                    /* Removed required */
                    value={nomPropriete}
                    onChange={(e) => setNomPropriete(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white transition-all"
                    placeholder="Ex: Pharmacie Centrale"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={zoneId}
                    onChange={(e) => setZoneId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white transition-all"
                  >
                    <option value="">Sélectionner une zone</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Items List (Panneaux) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-slate-800">Articles de la commande</h3>
                    <button 
                        type="button" 
                        onClick={addItem}
                        className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                    >
                        <Icon name="add" className="h-4 w-4" />
                        <span>Ajouter un article</span>
                    </button>
                </div>

                {items.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                        {/* Item Header */}
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <span className="bg-white border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                                    {index + 1}
                                </span>
                                <select
                                    value={item.type}
                                    onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                    <option value={TypeTravaux.PANNEAU}>Panneau</option>
                                    <option value={TypeTravaux.ONEWAY}>Oneway (Vitrine)</option>
                                </select>
                            </div>
                            
                            {items.length > 1 && (
                                <button 
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer cet article"
                                >
                                    <Icon name="delete" className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Item Body */}
                        <div className="p-6 space-y-6">
                            {/* Type Specific Fields */}
                            {item.type === TypeTravaux.PANNEAU ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hauteur (cm)</label>
                                            <input 
                                                type="number" 
                                                value={item.hauteur}
                                                onChange={e => updateItem(item.id, 'hauteur', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Largeur (cm)</label>
                                            <input 
                                                type="number" 
                                                value={item.largeur}
                                                onChange={e => updateItem(item.id, 'largeur', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Type de Panneau</label>
                                        <div className="flex flex-wrap gap-2">
                                            {OPTIONS_CONTENU.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => toggleContenu(item.id, opt)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                        item.contenu.includes(opt)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Texte Manuscrit / Détails</label>
                                    <textarea 
                                        value={item.manuscriptText}
                                        onChange={e => updateItem(item.id, 'manuscriptText', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Description..."
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Texte à afficher (Nom Saisi)</label>
                                    <input 
                                        type="text" 
                                        value={item.nomSaisi}
                                        onChange={e => updateItem(item.id, 'nomSaisi', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Texte principal..."
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.logoNomRequis ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                            {item.logoNomRequis && <Icon name="check" className="h-3 w-3 text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox"
                                            className="hidden"
                                            checked={item.logoNomRequis}
                                            onChange={(e) => updateItem(item.id, 'logoNomRequis', e.target.checked)}
                                        />
                                        <span className="text-sm text-slate-600 font-medium">Logo Requis</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Global Files Upload */}
            <section className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Fichiers Globaux</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div 
                        onClick={() => logoInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50 ${
                            logoFile ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300'
                        }`}
                    >
                        <input 
                            type="file" 
                            ref={logoInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                        />
                        <Icon name="cloud-upload" className={`h-8 w-8 mx-auto mb-2 ${logoFile ? 'text-blue-600' : 'text-slate-400'}`} />
                        <p className="text-sm font-medium text-slate-700 truncate px-2">
                            {logoFile ? logoFile.name : "Uploader le Logo"}
                        </p>
                    </div>

                    {/* Facade Upload */}
                    <div 
                        onClick={() => facadeInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50 ${
                            facadeFile ? 'border-purple-500 bg-purple-50/50' : 'border-slate-300'
                        }`}
                    >
                        <input 
                            type="file" 
                            ref={facadeInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'facade')}
                        />
                        <Icon name="image" className={`h-8 w-8 mx-auto mb-2 ${facadeFile ? 'text-purple-600' : 'text-slate-400'}`} />
                        <p className="text-sm font-medium text-slate-700 truncate px-2">
                            {facadeFile ? facadeFile.name : "Photo de Façade"}
                        </p>
                    </div>
                </div>
            </section>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-between">
          <p className="text-sm text-slate-500 hidden md:block">
            Total articles : <strong className="text-slate-800">{items.length}</strong>
          </p>
          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-semibold text-sm rounded-lg hover:bg-slate-100">
                Annuler
            </button>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg disabled:opacity-50 transition-all shadow-md flex items-center space-x-2 text-sm"
            >
                {loading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Création...</span>
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
    </div>
  );
};

export default CreateOrderModal;