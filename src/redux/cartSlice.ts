import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: any; // Cho các field khác của sản phẩm
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]')
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setToCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(item => item._id === action.payload._id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    }
  }
});

export const { setToCart, addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;