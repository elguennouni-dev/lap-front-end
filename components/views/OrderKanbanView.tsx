import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Customer } from '../../types';
import { api } from '../../services/api';
import OrderDetailModal from './OrderDetailModal';
import { Icon } from '../common/Icon';

const statusOrder: OrderStatus[] = [
    OrderStatus.NEW_ORDER,
    OrderStatus.DESIGN_ASSIGNED,
    OrderStatus.DESIGN_IN_PROGRESS,
    OrderStatus.DESIGN_PENDING_APPROVAL,
    OrderStatus.DESIGN_APPROVED,
    OrderStatus.PRODUCTION_ASSIGNED,
    OrderStatus.PRODUCTION_IN_PROGRESS,
    OrderStatus.PRODUCTION_COMPLETE,
    OrderStatus.FINAL_PENDING_APPROVAL,
    OrderStatus.COMPLETED,
];

const getStatusColorInfo = (status: OrderStatus): { border: string, text: string, bg: string, gradient: string } => {
    const colors = {
        [OrderStatus.NEW_ORDER]: { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
        [OrderStatus.DESIGN_ASSIGNED]: { border: 'border-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', gradient: 'from-yellow-500 to-yellow-600' },
        [OrderStatus.DESIGN_IN_PROGRESS]: { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
        [OrderStatus.DESIGN_PENDING_APPROVAL]: { border: 'border-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
        [OrderStatus.DESIGN_APPROVED]: { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
        [OrderStatus.PRODUCTION_ASSIGNED]: { border: 'border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-indigo-600' },
        [OrderStatus.PRODUCTION_IN_PROGRESS]: { border: 'border-pink-500', text: 'text-pink-600', bg: 'bg-pink-50', gradient: 'from-pink-500 to-pink-600' },
        [OrderStatus.PRODUCTION_COMPLETE]: { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-500 to-teal-600' },
        [OrderStatus.FINAL_PENDING_APPROVAL]: { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-amber-600' },
        [OrderStatus.COMPLETED]: { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-emerald-600' },
    };
    return colors[status] || { border: 'border-gray-500', text: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-gray-500 to-gray-600' };
};

const getStatusIcon = (status: OrderStatus): string => {
    const icons = {
        [OrderStatus.NEW_ORDER]: 'add-circle',
        [OrderStatus.DESIGN_ASSIGNED]: 'assignment',
        [OrderStatus.DESIGN_IN_PROGRESS]: 'design',
        [OrderStatus.DESIGN_PENDING_APPROVAL]: 'pending',
        [OrderStatus.DESIGN_APPROVED]: 'check-circle',
        [OrderStatus.PRODUCTION_ASSIGNED]: 'print',
        [OrderStatus.PRODUCTION_IN_PROGRESS]: 'build',
        [OrderStatus.PRODUCTION_COMPLETE]: 'assignment-turned-in',
        [OrderStatus.FINAL_PENDING_APPROVAL]: 'verified',
        [OrderStatus.COMPLETED]: 'verified',
    };
    return icons[status] || 'assignment';
};

const OrderCard: React.FC<{ order: Order; onClick: () => void; customerName: string }> = ({ order, onClick, customerName }) => {
    const colorInfo = getStatusColorInfo(order.status);
    
    return (
        <div 
            onClick={onClick}
            className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-xl hover:border-slate-300 transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${colorInfo.gradient}`}>
                        <Icon name={getStatusIcon(order.status)} className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{order.order_number}</p>
                </div>
                <p className="text-xs text-slate-500">{new Date(order.order_date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800 truncate">{customerName}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">{order.total_amount.toFixed(2)} Dh</span>
                    <Icon name="chevron-right" className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
            </div>
        </div>
    );
};

const StatusSection: React.FC<{ 
    title: OrderStatus; 
    orders: Order[]; 
    onCardClick: (order: Order) => void; 
    customers: Customer[] 
}> = ({ title, orders, onCardClick, customers }) => {
    const customerMap = useMemo(() => new Map(customers.map(c => [c.customer_id, c.company_name])), [customers]);
    const colorInfo = getStatusColorInfo(title);
    
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${colorInfo.gradient}`}>
                        <Icon name={getStatusIcon(title)} className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm capitalize">
                            {title.toLowerCase().replace(/_/g, ' ')}
                        </h3>
                        <p className="text-xs text-slate-500">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${colorInfo.bg} ${colorInfo.text}`}>
                    {orders.length}
                </span>
            </div>
            
            <div className="space-y-3">
                {orders.map(order => (
                    <OrderCard 
                        key={order.order_id} 
                        order={order} 
                        onClick={() => onCardClick(order)}
                        customerName={customerMap.get(order.customer_id) || 'Client Inconnu'}
                    />
                ))}
                
                {orders.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <Icon name="inventory" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune commande</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const OrderKanbanView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

    const fetchAllData = async () => {
        setLoading(true);
        try {
             const [fetchedOrders, fetchedCustomers] = await Promise.all([
                api.getOrders(),
                api.getCustomers()
            ]);
            setOrders(fetchedOrders);
            setCustomers(fetchedCustomers);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCloseModal = (updatedOrder?: Order) => {
        if(updatedOrder) {
            setOrders(prevOrders => prevOrders.map(o => o.order_id === updatedOrder.order_id ? updatedOrder : o));
        }
        setSelectedOrder(null);
    };
    
    const ordersByStatus = useMemo(() => {
        return orders.reduce((acc, order) => {
            (acc[order.status] = acc[order.status] || []).push(order);
            return acc;
        }, {} as Record<OrderStatus, Order[]>);
    }, [orders]);

    const filteredStatuses = filterStatus === 'ALL' 
        ? statusOrder 
        : [filterStatus];

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-800 font-medium">Chargement des commandes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Commandes en Cours</h2>
                    <p className="text-slate-600">{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
                </div>
                
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
                    className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="ALL">Tous les statuts</option>
                    {statusOrder.map(status => (
                        <option key={status} value={status}>
                            {getStatusColorInfo(status).text ? status.replace(/_/g, ' ') : status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
                {filteredStatuses.map(status => (
                    <StatusSection 
                        key={status}
                        title={status}
                        orders={ordersByStatus[status] || []}
                        onCardClick={setSelectedOrder}
                        customers={customers}
                    />
                ))}
            </div>

            {selectedOrder && (
                <OrderDetailModal 
                    orderId={selectedOrder.order_id}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default OrderKanbanView;