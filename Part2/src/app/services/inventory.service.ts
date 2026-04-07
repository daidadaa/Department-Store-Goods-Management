// WU Shaowei, PROG2005 A2 Part 2
import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private items: Item[] = [
    {
      id: 'E1001',
      name: 'MacBook Pro',
      category: 'Electronics',
      quantity: 4,
      price: 1999.99,
      supplier: 'Apple',
      stockStatus: 'In Stock',
      popular: 'Yes',
      comment: 'Best seller'
    },
    {
      id: 'F1001',
      name: 'Office Chair',
      category: 'Furniture',
      quantity: 2,
      price: 299.99,
      supplier: 'ErgoWorks',
      stockStatus: 'Low Stock',
      popular: 'No'
    },
    {
      id: 'T1001',
      name: 'Hammer',
      category: 'Tools',
      quantity: 0,
      price: 12.5,
      supplier: 'Stanley',
      stockStatus: 'Out of Stock',
      popular: 'No'
    }
  ];

  getAll(): Item[] {
    return this.items.map((item) => ({ ...item }));
  }

  getPopular(): Item[] {
    return this.getAll().filter((item) => item.popular === 'Yes');
  }

  searchByName(name: string): Item[] {
    const term = name.trim().toLowerCase();
    return this.getAll().filter((item) => item.name.toLowerCase().includes(term));
  }

  addItem(item: Item): { ok: boolean; message: string } {
    if (this.items.some((x) => x.id.toLowerCase() === item.id.toLowerCase())) {
      return { ok: false, message: 'This goods ID already exists.' };
    }

    if (this.items.some((x) => x.name.toLowerCase() === item.name.toLowerCase())) {
      return { ok: false, message: 'This goods name already in list.' };
    }

    this.items.push({ ...item });
    return { ok: true, message: `Add success: ${item.name}` };
  }

  updateByName(targetName: string, next: Item): { ok: boolean; message: string } {
    const index = this.items.findIndex((x) => x.name.toLowerCase() === targetName.trim().toLowerCase());
    if (index === -1) return { ok: false, message: 'Goods not found.' };

    const dupId = this.items.findIndex((x) => x.id.toLowerCase() === next.id.toLowerCase());
    if (dupId !== -1 && dupId !== index) {
      return { ok: false, message: 'This goods ID belongs to other goods.' };
    }

    const dupName = this.items.findIndex((x) => x.name.toLowerCase() === next.name.toLowerCase());
    if (dupName != -1 && dupName !== index) {
      return { ok: false, message: 'This goods name belongs to other goods.' };
    }

    this.items[index] = { ...next };
    return { ok: true, message: `Update success: ${targetName}` };
  }

  deleteByName(targetName: string): { ok: boolean; message: string } {
    const index = this.items.findIndex((x) => x.name.toLowerCase() === targetName.trim().toLowerCase());
    if (index === -1) return { ok: false, message: 'Goods not found.' };

    const deleted = this.items[index];
    this.items.splice(index, 1);
    return { ok: true, message: `Delete success: ${deleted.name}` };
  }
}
