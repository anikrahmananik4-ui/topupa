export interface Game {
  id: number;
  name: string;
  type: 'uid' | 'voucher' | 'email' | 'phone' | string;
  description: string;
  image: string;
}

export interface Product {
  id: number;
  game_id: number;
  name: string;
  price: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  logo: string;
  qr_image: string;
  number: string;
  description: string;
  short_desc: string;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  game_id: number;
  game_name?: string;
  product_id: number;
  product_name?: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  player_id: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
}

export interface Deposit {
  id: number;
  user_id: number;
  user_name?: string;
  amount: number;
  method: string;
  wallet_number: string;
  trx_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  balance: number;
  created_at: string;
}

export interface Setting {
  id: number;
  name: string;
  value: string;
}

export interface Slider {
  id: number;
  image: string;
  link: string;
}

export interface RedeemCode {
  id: number;
  game_id: number;
  product_id: number;
  code: string;
  status: 'active' | 'used' | 'expired';
  order_id: number;
}
