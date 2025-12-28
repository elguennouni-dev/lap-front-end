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
  
  // Note: Backend UserDto might differ slightly, but we send what's needed for creation
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: UserRole.DESIGNER as UserRole, // Backend typically accepts one primary role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to create user
      const newUser = await api.createUser({
        ...formData
      });
      
      onUserCreated(newUser);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create user', error);
      alert('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: UserRole.DESIGNER,
    });
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.ADMINISTRATEUR]: 'admin-panel-settings',
      [UserRole.DESIGNER]: 'design',
      [UserRole.IMPRIMEUR]: 'print',
      [UserRole.COMMERCIAL]: 'person',
      [UserRole.LOGISTIQUE]: 'delivery',
    };
    return icons[role] || 'person';
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMINISTRATEUR]: 'from-red-500 to-red-600',
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
              
              {/* Account Info */}
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

            {/* Roles Selection */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="groups" className="h-5 w-5 text-white" />
                  </div>
                  <span>Rôle Principal</span>
                </h3>
                
                <div className="space-y-4">
                  <p className="text-slate-600 text-lg">
                    Sélectionnez le rôle attribué à cet utilisateur
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {Object.values(UserRole).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: role }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.role === role
                            ? `border-transparent bg-gradient-to-r ${getRoleColor(role)} text-white shadow-lg`
                            : 'border-slate-300 bg-white text-slate-700 hover:border-purple-500/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            formData.role === role 
                              ? 'bg-white/20' 
                              : 'bg-slate-100'
                          }`}>
                            <Icon 
                              name={getRoleIcon(role)} 
                              className={`h-5 w-5 ${
                                formData.role === role ? 'text-white' : 'text-slate-600'
                              }`} 
                            />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-lg block capitalize">
                              {role}
                            </span>
                            <span className={`text-sm ${
                              formData.role === role ? 'text-white/90' : 'text-slate-500'
                            }`}>
                              {role === UserRole.ADMINISTRATEUR && 'Accès complet au système'}
                              {role === UserRole.DESIGNER && 'Gestion des designs'}
                              {role === UserRole.IMPRIMEUR && 'Gestion de la production'}
                              {role === UserRole.COMMERCIAL && 'Suivi des commandes'}
                              {role === UserRole.LOGISTIQUE && 'Livraison et installation'}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            formData.role === role
                              ? 'bg-white border-white'
                              : 'border-slate-400'
                          } flex items-center justify-center`}>
                            {formData.role === role && (
                              <Icon name="check" className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
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