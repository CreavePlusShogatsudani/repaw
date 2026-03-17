import { supabase } from './supabase';
import { CartItem } from '../contexts/CartContext';

export interface OrderData {
    userId?: string;
    totalAmount: number;
    shippingAddress: any;
    paymentIntentId?: string;
    cartItems: CartItem[];
}

export async function createOrder(orderData: OrderData) {
    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: orderData.userId || (await supabase.auth.getUser()).data.user?.id,
                total_amount: orderData.totalAmount,
                shipping_address: orderData.shippingAddress,
                stripe_payment_intent_id: orderData.paymentIntentId,
                status: 'paid' // Assuming this is called after successful payment
            })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!order) throw new Error('Failed to create order');

        // 2. Create Order Items
        const orderItems = orderData.cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return order;

    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}
