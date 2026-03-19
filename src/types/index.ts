export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    address: string | null;
    phone: string | null;
    pet_name: string | null;
    pet_breed: string | null;
    instagram_account: string | null;
    show_instagram: boolean | null;
    postal_code: string | null;
    prefecture: string | null;
    city: string | null;
    building: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    category: string | null;
    size: string | null;
    color: string | null;
    condition: string | null;
    images: string[] | null;
    stock: number;
    status: string | null;
    seller_id: string | null;
    seller_instagram: string | null;
    size_chart: SizeChartRow[] | null;
    back_length_cm: number | null;
    chest_cm: number | null;
    neck_cm: number | null;
    created_at: string;
    updated_at: string;
}

export interface SizeChartRow {
    size: string;
    back_length: string;
    chest: string;
    neck: string;
    weight: string;
}

export interface Order {
    id: string;
    user_id: string | null;
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    total_amount: number;
    shipping_address: any; // JSONB
    stripe_payment_intent_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    quantity: number;
    price_at_purchase: number;
    created_at: string;
}
