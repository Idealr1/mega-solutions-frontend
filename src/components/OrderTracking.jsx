import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import './OrderTracking.css';

const OrderTracking = ({ status, estimatedDays, rejectionReason }) => {
    const stages = [
        { id: 'pending', label: 'Received', icon: Clock },
        { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
        { id: 'accepted', label: 'Accepted', icon: Package },
        { id: 'in_production', label: 'In Production', icon: Package },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
    ];

    const getStatusIndex = (currentStatus) => {
        const indexMap = {
            'pending': 0,
            'confirmed': 1,
            'accepted': 2,
            'in_production': 3,
            'shipped': 4,
            'delivered': 5,
            'cancelled': -1,
            'rejected': -1
        };
        return indexMap[currentStatus] ?? 0;
    };

    const currentIndex = getStatusIndex(status);

    if (status === 'cancelled' || status === 'rejected') {
        return (
            <div className="order-tracking-error">
                <XCircle size={40} color="#dc2626" />
                <div className="error-info">
                    <h4>Order {status === 'cancelled' ? 'Cancelled' : 'Rejected'}</h4>
                    <p>{rejectionReason || "Please contact support for more information."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-tracking-container">
            <div className="tracking-timeline">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={stage.id} className={`tracking-stage ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="stage-icon-wrapper">
                                {isCompleted ? <Check size={16} /> : <Icon size={20} />}
                            </div>
                            <span className="stage-label">{stage.label}</span>
                            {index < stages.length - 1 && <div className="stage-connector"></div>}
                        </div>
                    );
                })}
            </div>
            {['accepted', 'in_production', 'shipped'].includes(status) && estimatedDays && (
                <div className="tracking-info fade-in">
                    <p><strong>Estimated Delivery:</strong> {estimatedDays} working days from confirmation.</p>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
