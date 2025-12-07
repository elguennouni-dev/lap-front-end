import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../services/api';
import { Icon } from '../common/Icon';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    roles: [] as UserRole[],
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newUser = await api.createUser({
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      onUserCreated(newUser);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create user', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      roles: [],
      is_active: true,
    });
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.ADMIN]: 'admin-panel-settings',
      [UserRole.DESIGNER]: 'design',
      [UserRole.IMPRIMEUR]: 'print',
      [UserRole.COMMERCIAL]: 'person',
      [UserRole.LOGISTIQUE]: 'delivery',
    };
    return icons[role] || 'person';
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: 'from-red-500 to-red-600',
      [UserRole.DESIGNER]: 'from-purple-500 to-purple-600',
      [UserRole.IMPRIMEUR]: 'from-blue-500 to-blue-600',
      [UserRole.COMMERCIAL]: 'from-green-500 to-green-600',
      [UserRole.LOGISTIQUE]: 'from-orange-500 to-orange-600',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Nouvel Utilisateur</h2>
              <p className="text-slate-600 text-lg mt-2">Ajoutez un nouveau membre à votre équipe</p>
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
                  <span>Informations Personnelles</span>
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="Karim"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-slate-700 mb-3">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="Benali"
                      />
                    </div>
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
                      placeholder="karim.benali@lap.ma"
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
                      placeholder="+212 6 61 23 45 67"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon name="lock" className="h-5 w-5 text-white" />
                  </div>
                  <span>Identifiants de Connexion</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Nom d'utilisateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="k.benali"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-700 mb-3">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="groups" className="h-5 w-5 text-white" />
                  </div>
                  <span>Rôles et Permissions</span>
                </h3>
                
                <div className="space-y-4">
                  <p className="text-slate-600 text-lg">
                    Sélectionnez les rôles attribués à cet utilisateur
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {Object.values(UserRole).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleToggle(role)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.roles.includes(role)
                            ? `border-transparent bg-gradient-to-r ${getRoleColor(role)} text-white shadow-lg`
                            : 'border-slate-300 bg-white text-slate-700 hover:border-purple-500/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            formData.roles.includes(role) 
                              ? 'bg-white/20' 
                              : 'bg-slate-100'
                          }`}>
                            <Icon 
                              name={getRoleIcon(role)} 
                              className={`h-5 w-5 ${
                                formData.roles.includes(role) ? 'text-white' : 'text-slate-600'
                              }`} 
                            />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-lg block capitalize">
                              {role.toLowerCase()}
                            </span>
                            <span className={`text-sm ${
                              formData.roles.includes(role) ? 'text-white/90' : 'text-slate-500'
                            }`}>
                              {role === UserRole.ADMIN && 'Accès complet au système'}
                              {role === UserRole.DESIGNER && 'Gestion des designs et créations'}
                              {role === UserRole.IMPRIMEUR && 'Gestion de la production et impression'}
                              {role === UserRole.COMMERCIAL && 'Gestion des clients et commandes'}
                              {role === UserRole.LOGISTIQUE && 'Gestion de livraison et installation'}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            formData.roles.includes(role)
                              ? 'bg-white border-white'
                              : 'border-slate-400'
                          } flex items-center justify-center`}>
                            {formData.roles.includes(role) && (
                              <Icon name="check" className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                    <Icon name="settings" className="h-5 w-5 text-white" />
                  </div>
                  <span>Paramètres du Compte</span>
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
                      Compte actif
                    </label>
                    <p className="text-slate-600 text-sm">
                      L'utilisateur pourra se connecter au système
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
              disabled={loading || formData.roles.length === 0}
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
                  <span>Créer l'Utilisateur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;