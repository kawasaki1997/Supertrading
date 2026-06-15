export type UIProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  sold: number;
  badge: string | null;
  image: string | null;
  deliveryType: string; // AUTO | MANUAL
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  balance: number;
  role: string;
};

export type UICategory = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  products: UIProduct[];
};
