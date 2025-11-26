import { useState, useEffect, useMemo } from 'react';
import { DeliveryTemplate, OrderItem, Product } from '@/types';

interface UseOrderCalculatorProps {
    items: OrderItem[];
    products: Product[];
    deliveryTemplate?: DeliveryTemplate;
    totalWeight: number;
    discount: number;
}

interface OrderCalculation {
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    itemsTotal: { [key: string]: number };
}

/**
 * Custom hook for real-time order calculation
 * Handles delivery fee calculation based on weight and template
 * Formula: Base Price + ((Total Weight - 1) * Extra Price)
 */
export function useOrderCalculator({
    items,
    products,
    deliveryTemplate,
    totalWeight,
    discount,
}: UseOrderCalculatorProps): OrderCalculation {
    const [deliveryFee, setDeliveryFee] = useState(0);

    // Calculate delivery fee when weight or template changes
    useEffect(() => {
        if (deliveryTemplate && totalWeight > 0) {
            const firstKg = deliveryTemplate.firstKgPrice;
            const extraKg = deliveryTemplate.extraKgPrice;

            if (totalWeight <= 1) {
                setDeliveryFee(firstKg);
            } else {
                const fee = firstKg + (totalWeight - 1) * extraKg;
                setDeliveryFee(Math.round(fee * 100) / 100);
            }
        } else {
            setDeliveryFee(0);
        }
    }, [deliveryTemplate, totalWeight]);

    // Calculate subtotal and item totals
    const { subtotal, itemsTotal } = useMemo(() => {
        let subtotal = 0;
        const itemsTotal: { [key: string]: number } = {};

        items.forEach((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                itemsTotal[item.productId] = itemTotal;
                subtotal += itemTotal;
            }
        });

        return { subtotal, itemsTotal };
    }, [items, products]);

    // Calculate final total
    const totalAmount = useMemo(() => {
        return Math.max(0, subtotal - discount + deliveryFee);
    }, [subtotal, discount, deliveryFee]);

    return {
        subtotal,
        deliveryFee,
        totalAmount,
        itemsTotal,
    };
}
