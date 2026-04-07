import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { InventoryItem, Category, StockStatus, Popular } from '../models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  popularItems: InventoryItem[] = [];
  
  formData = {
    name: '',
    category: 'Electronics' as Category,
    quantity: 0,
    price: 0,
    supplier: '',
    stockStatus: 'In Stock' as StockStatus,
    popular: 'No' as Popular,
    comment: ''
  };
  
  updateTarget = '';
  message = '';
  messageType = 'success';
  showConfirm = false;
  pendingDelete = '';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.items = this.inventoryService.getAll();
    this.popularItems = this.inventoryService.getPopular();
  }

  addItem() {
    if (!this.formData.name.trim()) {
      this.showMessage('Name is required', 'error');
      return;
    }
    if (this.formData.quantity < 0) {
      this.showMessage('Quantity must be 0 or greater', 'error');
      return;
    }
    if (this.formData.price <= 0) {
      this.showMessage('Price must be greater than 0', 'error');
      return;
    }
    if (!this.formData.supplier.trim()) {
      this.showMessage('Supplier is required', 'error');
      return;
    }

    const success = this.inventoryService.add(this.formData);
    if (success) {
      this.showMessage('Item added successfully', 'success');
      this.loadData();
      this.resetForm();
    } else {
      this.showMessage('Item with this name already exists', 'error');
    }
  }

  prepareUpdate() {
    const target = this.updateTarget.trim();
    if (!target) {
      this.showMessage('Enter name to update', 'error');
      return;
    }
    const item = this.inventoryService.getItemByName(target);
    if (item) {
      this.formData = {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        supplier: item.supplier,
        stockStatus: item.stockStatus,
        popular: item.popular,
        comment: item.comment || ''
      };
      this.showMessage(`Loaded "${target}" for editing`, 'success');
    } else {
      this.showMessage('Item not found', 'error');
    }
  }

  confirmUpdate() {
    const success = this.inventoryService.updateByName(this.updateTarget, this.formData);
    if (success) {
      this.showMessage('Item updated successfully', 'success');
      this.loadData();
      this.resetForm();
    } else {
      this.showMessage('Update failed - item not found', 'error');
    }
  }

  prepareDelete(name: string) {
    this.pendingDelete = name;
    this.showConfirm = true;
  }

  deleteConfirmed() {
    const success = this.inventoryService.deleteByName(this.pendingDelete);
    if (success) {
      this.showMessage(`Deleted "${this.pendingDelete}"`, 'success');
      this.loadData();
    } else {
      this.showMessage('Delete failed', 'error');
    }
    this.showConfirm = false;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      category: 'Electronics',
      quantity: 0,
      price: 0,
      supplier: '',
      stockStatus: 'In Stock',
      popular: 'No',
      comment: ''
    };
    this.updateTarget = '';
  }

  showMessage(msg: string, type: string) {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}