import { Injectable } from '@angular/core';
import { InventoryItem, Category, StockStatus, Popular } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private items: InventoryItem[] = [];
  private nextId = 1;

  constructor() {
    // 初始数据
    this.items = [
      { id: this.nextId++, name: 'MacBook Pro', category: 'Electronics', quantity: 5, price: 1999.99, supplier: 'Apple', stockStatus: 'In Stock', popular: 'Yes', comment: 'Best seller' },
      { id: this.nextId++, name: 'Gaming Chair', category: 'Furniture', quantity: 2, price: 299.99, supplier: 'Secretlab', stockStatus: 'Low Stock', popular: 'No' },
      { id: this.nextId++, name: 'Desk Lamp', category: 'Tools', quantity: 10, price: 49.99, supplier: 'IKEA', stockStatus: 'In Stock', popular: 'No' },
    ];
  }

  getAll(): InventoryItem[] {
    return [...this.items];
  }

  getPopular(): InventoryItem[] {
    return this.items.filter(i => i.popular === 'Yes');
  }

  searchByName(term: string): InventoryItem[] {
    if (!term.trim()) return this.getAll();
    return this.items.filter(i => i.name.toLowerCase().includes(term.toLowerCase()));
  }

  add(item: Omit<InventoryItem, 'id'>): boolean {
    if (this.items.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
      return false;
    }
    this.items.push({ id: this.nextId++, ...item });
    return true;
  }

  updateByName(currentName: string, updated: Omit<InventoryItem, 'id'>): boolean {
    const idx = this.items.findIndex(i => i.name.toLowerCase() === currentName.toLowerCase());
    if (idx === -1) return false;
    this.items[idx] = { ...updated, id: this.items[idx].id };
    return true;
  }

  deleteByName(name: string): boolean {
    const len = this.items.length;
    this.items = this.items.filter(i => i.name.toLowerCase() !== name.toLowerCase());
    return len !== this.items.length;
  }

  getItemByName(name: string): InventoryItem | undefined {
    return this.items.find(i => i.name.toLowerCase() === name.toLowerCase());
  }
}