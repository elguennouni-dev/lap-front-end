import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../common/Icon';
import { api } from '@/services/api';
import { Zone } from '@/types';

const Settings: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [newZoneName, setNewZoneName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchZones = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedZones = await api.getZones();
            setZones(fetchedZones);
        } catch (error) {
            console.error('Failed to fetch zones:', error);
            setZones([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const handleCreateZone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZoneName.trim()) {
            alert("Veuillez entrer un nom pour la zone.");
            return;
        }

        setActionLoading(true);
        try {
            // Assuming backend endpoint POST /zone handles a JSON body { "nom": "..." }
            // Since we only exposed GET /zone in api.ts, we'll implement a temporary POST here
            // You MUST add this method to api.ts:
            // api.createZone = (nom: string) => fetch(..., method: 'POST', body: JSON.stringify({ nom }));
            
            const createZoneEndpoint = 'http://localhost:2099/zone';
            await fetch(createZoneEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nom: newZoneName.trim() })
            });

            setNewZoneName('');
            await fetchZones();
        } catch (error) {
            console.error('Erreur lors de la création de la zone:', error);
            alert("Erreur lors de la création. Vérifiez la console.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteZone = async (id: number) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la zone #${id}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            // You MUST add this method to api.ts:
            // api.deleteZone = (id: number) => fetch(`/zone/${id}`, method: 'DELETE');
            
            const deleteZoneEndpoint = `http://localhost:2099/zone/${id}`;
            await fetch(deleteZoneEndpoint, {
                method: 'DELETE',
                credentials: 'include'
            });

            await fetchZones();
        } catch (error) {
            console.error('Erreur lors de la suppression de la zone:', error);
            alert("Erreur lors de la suppression. Vérifiez la console.");
        } finally {
            setActionLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-800">Paramètres du Système</h1>
            </div>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-3">
                    <Icon name="location" className="h-6 w-6 text-blue-600" />
                    <span>Gestion des Zones</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Zone Form */}
                    <div className="md:col-span-1 border-r border-slate-100 pr-6">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Ajouter une nouvelle Zone</h3>
                        <form onSubmit={handleCreateZone} className="space-y-4">
                            <label className="block text-sm font-medium text-slate-600">Nom de la Zone (Ex: R1, R2)</label>
                            <input
                                type="text"
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Entrer le nom de la zone"
                                required
                            />
                            <button
                                type="submit"
                                disabled={actionLoading || !newZoneName.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <Icon name="add" className="h-5 w-5" />
                                )}
                                <span>Créer la Zone</span>
                            </button>
                        </form>
                    </div>

                    {/* Zone List */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Zones Actuelles ({zones.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-1">
                            {zones.length > 0 ? (
                                zones.map(zone => (
                                    <div key={zone.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                                        <span className="font-medium text-slate-800 text-base">{zone.nom}</span>
                                        <button
                                            onClick={() => handleDeleteZone(zone.id)}
                                            disabled={actionLoading}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Icon name="delete" className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
                                    <p>Aucune zone configurée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Settings;