import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface CartItem {
    id: number;
    productId: string;
    name: string;
    price: number;
    size: string | null;
    color: string | null;
    quantity: number;
    image: string;
    seller: string | null;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    /** DBの在庫状態と突き合わせ、買えなくなった商品をカートから外す。外した商品名を返す */
    syncWithStock: (userId?: string) => Promise<string[]>;
    totalAmount: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('cartItems');
            const items: CartItem[] = stored ? JSON.parse(stored) : [];
            return items.map(i => ({ ...i, quantity: 1 }));
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }, [cartItems]);

    // 一点物なので同じ商品は1つまで、数量は常に1
    const addToCart = (item: Omit<CartItem, 'id'>) => {
        setCartItems(prev => {
            if (prev.some(i => i.productId === item.productId)) return prev;
            return [...prev, { ...item, quantity: 1, id: Date.now() }];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // published 以外（売り切れ・非公開・他の人が購入手続き中）をカートから外す。
    // 自分が予約中（reserved_by = 自分）の商品は残す。
    const syncWithStock = async (userId?: string): Promise<string[]> => {
        if (cartItems.length === 0) return [];
        const { data, error } = await supabase
            .from('products')
            .select('id, status, reserved_by')
            .in('id', cartItems.map(i => i.productId));
        if (error || !data) return [];

        const byId = new Map(data.map(p => [p.id, p]));
        const isAvailable = (productId: string) => {
            const p = byId.get(productId);
            if (!p) return false;
            if (p.status === 'published') return true;
            return p.status === 'reserved' && !!userId && p.reserved_by === userId;
        };

        const removed = cartItems.filter(i => !isAvailable(i.productId));
        if (removed.length > 0) {
            const removedIds = new Set(removed.map(i => i.id));
            setCartItems(prev => prev.filter(i => !removedIds.has(i.id)));
        }
        return removed.map(i => i.name);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            syncWithStock,
            totalAmount,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
