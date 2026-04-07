// WU Shaowei, PROG2005 A2 Part 2
export type Category = 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type Popular = 'Yes' | 'No';

export interface Item {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  price: number;
  supplier: string;
  stockStatus: StockStatus;
  popular: Popular;
  comment?: string;
}
