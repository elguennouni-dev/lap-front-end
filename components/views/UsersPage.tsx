import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import CreateUserModal from '../modals/CreateUserModal';

const UsersPage: React.FC = () => {
  const { currentUser, users, refreshUsers } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if current user is Admin
  const isAdmin = currentUser?.role === UserRole.ADMINISTRATEUR;

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMINISTRATEUR]: 'bg-red-100 text-red-700 border-red-200',
      [UserRole.COMMERCIAL]: 'bg-blue-100 text-blue-700 border-blue-200',
      [UserRole.DESIGNER]: 'bg-purple-100 text-purple-700 border-purple-200',
      [UserRole.IMPRIMEUR]: 'bg-green-100 text-green-700 border-green-200',
      [UserRole.LOGISTIQUE]: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleUserCreated = (newUser: User) => {
    refreshUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setLoading(true);
      try {
        // Backend currently might not have DELETE /user/{id}, if not, this will fail gracefully
        // Or you can skip this if not implemented in backend yet.
        // Assuming api.deleteUser is a placeholder or implemented:
        // await api.deleteUser(userId); 
        alert("Fonctionnalité de suppression non disponible pour le moment.");
        // await refreshUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-slate-600 text-lg">Gestion des utilisateurs et permissions</p>
        </div>
        
        {/* Only Admin can add new users */}
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <Icon name="add" className="h-5 w-5" />
            <span className="text-lg">Nouvel Utilisateur</span>
          </button>
        )}
      </div>

      {/* Stats and Filters Section */}
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
              <span className="text-blue-100">Total utilisateurs</span>
              <span className="text-xl font-bold">{users.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Rôles différents</span>
              <span className="text-xl font-bold">
                {new Set(users.map(u => u.role)).size}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Icon name="filter-list" className="h-5 w-5 text-slate-600" />
            <span>Filtres</span>
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher (Nom, Email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'ALL')}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tous les rôles</option>
              <option value={UserRole.ADMINISTRATEUR}>Administrateur</option>
              <option value={UserRole.COMMERCIAL}>Commercial</option>
              <option value={UserRole.DESIGNER}>Designer</option>
              <option value={UserRole.IMPRIMEUR}>Imprimeur</option>
              <option value={UserRole.LOGISTIQUE}>Logistique</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Icon name="category" className="h-5 w-5 text-slate-600" />
            <span>Répartition</span>
          </h3>
          <div className="space-y-2">
            {[
              { role: UserRole.ADMINISTRATEUR, label: 'Admins', count: users.filter(u => u.role === UserRole.ADMINISTRATEUR).length },
              { role: UserRole.COMMERCIAL, label: 'Commerciaux', count: users.filter(u => u.role === UserRole.COMMERCIAL).length },
              { role: UserRole.DESIGNER, label: 'Designers', count: users.filter(u => u.role === UserRole.DESIGNER).length },
              { role: UserRole.IMPRIMEUR, label: 'Imprimeurs', count: users.filter(u => u.role === UserRole.IMPRIMEUR).length },
              { role: UserRole.LOGISTIQUE, label: 'Logistique', count: users.filter(u => u.role === UserRole.LOGISTIQUE).length },
            ].map(item => (
              <div key={item.role} className="flex items-center justify-between p-2">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item.role)}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Liste des Utilisateurs</h2>
            <div className="text-slate-600 font-medium">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-6 font-semibold text-slate-800 text-lg">Utilisateur</th>
                <th className="text-left p-6 font-semibold text-slate-800 text-lg">Email</th>
                <th className="text-left p-6 font-semibold text-slate-800 text-lg">Rôle</th>
                <th className="text-left p-6 font-semibold text-slate-800 text-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-lg">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-slate-700 font-medium">{user.email}</span>
                  </td>
                  <td className="p-6">
                    <span 
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Supprimer l'utilisateur"
                        >
                          <Icon name="delete" className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon name="people" className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Aucun utilisateur trouvé</h3>
            <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
              {searchTerm || selectedRole !== 'ALL' 
                ? "Aucun utilisateur ne correspond à vos critères de recherche."
                : "Commencez par ajouter votre premier utilisateur."
              }
            </p>
            {isAdmin && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                <Icon name="add" className="h-5 w-5" />
                <span>Ajouter un Utilisateur</span>
              </button>
            )}
          </div>
        )}
      </div>

      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UsersPage;