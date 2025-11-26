'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOrderCalculator } from '@/hooks/useOrderCalculator';
import { Product, Customer, DeliveryTemplate, OrderItem } from '@/types';
import api from '@/lib/api';

const orderSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    deliveryTemplateId: z.string().optional(),
    totalWeight: z.number().min(0).optional(),
    discount: z.number().min(0).default(0),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    orderSource: z.string().min(1, 'Order source is required'),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function CreateOrderForm() {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [deliveryTemplates, setDeliveryTemplates] = useState<DeliveryTemplate[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<DeliveryTemplate | undefined>();
    const [totalWeight, setTotalWeight] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [phoneSearch, setPhoneSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            discount: 0,
            paymentMethod: 'Cash',
            orderSource: 'WhatsApp',
        },
    });

    // Real-time calculation using our custom hook
    const { subtotal, deliveryFee, totalAmount, itemsTotal } = useOrderCalculator({
        items: orderItems,
        products,
        deliveryTemplate: selectedTemplate,
        totalWeight,
        discount,
    });

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCustomers();
        loadDeliveryTemplates();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const loadDeliveryTemplates = async () => {
        try {
            const response = await api.get('/delivery-templates');
            setDeliveryTemplates(response.data);
            // Set default template
            const defaultTemplate = response.data.find((t: DeliveryTemplate) => t.isDefault);
            if (defaultTemplate) {
                setSelectedTemplate(defaultTemplate);
                setValue('deliveryTemplateId', defaultTemplate.id);
            }
        } catch (error) {
            console.error('Failed to load delivery templates:', error);
        }
    };

    const searchCustomerByPhone = async () => {
        if (!phoneSearch) return;
        try {
            const response = await api.get(`/customers/search?phone=${phoneSearch}`);
            if (response.data) {
                setSelectedCustomer(response.data);
                setValue('customerId', response.data.id);
            } else {
                alert('Customer not found');
            }
        } catch (error) {
            alert('Customer not found');
        }
    };

    const addOrderItem = () => {
        setOrderItems([
            ...orderItems,
            { productId: '', quantity: 1, price: 0 },
        ]);
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
        const updated = [...orderItems];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-fill price when product is selected
        if (field === 'productId') {
            const product = products.find((p) => p.id === value);
            if (product) {
                updated[index].price = product.price;
            }
        }

        setOrderItems(updated);
    };

    const onSubmit = async (data: OrderFormData) => {
        if (orderItems.length === 0) {
            alert('Please add at least one item');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                ...data,
                items: orderItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                totalWeight: data.deliveryTemplateId ? totalWeight : undefined,
            };

            const response = await api.post('/orders', orderData);
            alert(`Order #${response.data.orderNumber} created successfully!`);

            // Reset form
            setOrderItems([]);
            setSelectedCustomer(null);
            setTotalWeight(0);
            setDiscount(0);
            setValue('customerId', '');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
                    <p className="text-muted-foreground">Fast order entry for cashiers and managers</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                            <CardDescription>Search by phone number or select existing customer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter phone number"
                                    value={phoneSearch}
                                    onChange={(e) => setPhoneSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchCustomerByPhone())}
                                />
                                <Button type="button" onClick={searchCustomerByPhone}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            </div>

                            {selectedCustomer && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="font-semibold">{selectedCustomer.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                                    <p className="text-sm text-muted-foreground">{selectedCustomer.address}, {selectedCustomer.city}</p>
                                </div>
                            )}

                            {!selectedCustomer && (
                                <div>
                                    <Label>Or select customer</Label>
                                    <Select onValueChange={(value) => {
                                        setValue('customerId', value);
                                        const customer = customers.find((c) => c.id === value);
                                        setSelectedCustomer(customer || null);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name} - {customer.phone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {errors.customerId && (
                                <p className="text-sm text-destructive">{errors.customerId.message}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Order Items</CardTitle>
                                    <CardDescription>Add products to the order</CardDescription>
                                </div>
                                <Button type="button" onClick={addOrderItem} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {orderItems.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No items added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start p-4 bg-muted/50 rounded-lg">
                                            <div className="flex-1 grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <Label className="text-xs">Product</Label>
                                                    <Select
                                                        value={item.productId}
                                                        onValueChange={(value) => updateOrderItem(index, 'productId', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    {product.name} - Rs. {product.price} (Stock: {product.stock})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOrderItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                                {item.productId && (
                                                    <p className="text-sm font-semibold">
                                                        Rs. {itemsTotal[item.productId]?.toFixed(2) || '0.00'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery & Payment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery & Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Delivery Template</Label>
                                <Select
                                    value={selectedTemplate?.id}
                                    onValueChange={(value) => {
                                        const template = deliveryTemplates.find((t) => t.id === value);
                                        setSelectedTemplate(template);
                                        setValue('deliveryTemplateId', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deliveryTemplates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name} (Rs. {template.firstKgPrice} + Rs. {template.extraKgPrice}/kg)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Total Weight (kg)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={totalWeight}
                                    onChange={(e) => {
                                        const weight = parseFloat(e.target.value) || 0;
                                        setTotalWeight(weight);
                                        setValue('totalWeight', weight);
                                    }}
                                    placeholder="0.0"
                                />
                            </div>

                            <div>
                                <Label>Payment Method</Label>
                                <Select defaultValue="Cash" onValueChange={(value) => setValue('paymentMethod', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Online">Online Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Order Source</Label>
                                <Select defaultValue="WhatsApp" onValueChange={(value) => setValue('orderSource', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="TikTok">TikTok</SelectItem>
                                        <SelectItem value="Web">Website</SelectItem>
                                        <SelectItem value="Phone">Phone Call</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2">
                                <Label>Discount (Rs.)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => {
                                        const disc = parseFloat(e.target.value) || 0;
                                        setDiscount(disc);
                                        setValue('discount', disc);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-medium">Rs. {deliveryFee.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>- Rs. {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>Rs. {totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Order...' : 'Create Order'}
                            </Button>

                            {selectedTemplate && totalWeight > 0 && (
                                <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                                    <p className="font-semibold mb-1">Delivery Calculation:</p>
                                    <p>Base (1kg): Rs. {selectedTemplate.firstKgPrice}</p>
                                    {totalWeight > 1 && (
                                        <p>Extra ({(totalWeight - 1).toFixed(1)}kg × Rs. {selectedTemplate.extraKgPrice}): Rs. {((totalWeight - 1) * selectedTemplate.extraKgPrice).toFixed(2)}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
