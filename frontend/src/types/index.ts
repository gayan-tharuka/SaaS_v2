export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    unit: string;
    stock: number;
    tenantId: string;
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    tenantId: string;
}

export interface DeliveryTemplate {
    id: string;
    name: string;
    firstKgPrice: number;
    extraKgPrice: number;
    isDefault: boolean;
    tenantId: string;
}

export interface OrderItem {
    id?: string;
    productId: string;
    product?: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    orderNumber: number;
    customerId: string;
    customer: Customer;
    status: OrderStatus;
    totalAmount: number;
    discount: number;
    deliveryFee: number;
    deliveryTemplateId?: string;
    deliveryTemplate?: DeliveryTemplate;
    paymentMethod: string;
    orderSource: string;
    items: OrderItem[];
    tenantId: string;
    createdAt: string;
}

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'READY'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'CANCELLED';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'MANAGER' | 'CASHIER';
    tenantId: string;
    tenant: {
        id: string;
        name: string;
    };
}

export interface AuthResponse {
    access_token: string;
    user: User;
}
