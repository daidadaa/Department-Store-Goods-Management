// WU Shaowei, PROG2005 A2 Part 2
import { Component } from '@angular/core';
import { Category, Item, Popular, StockStatus } from '../../models/item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  standalone: false,
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css']
})
export class InventoryManagementComponent {
  categories: Category[] = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  stockStatuses: StockStatus[] = ['In Stock', 'Low Stock', 'Out of Stock'];
  popularValues: Popular[] = ['Yes', 'No'];

  formItem: Item = this.createEmptyForm();
  searchInput = '';
  searchTerm = '';
  onlyPopular = false;
  editingName = '';
  selectedIds = new Set<string>();

  uiMessage = '';
  uiMessageIsError = false;
  private timerId: number | null = null;

  constructor(private readonly inventoryService: InventoryService) {}

  get items(): Item[] {
    return this.inventoryService.getAll();
  }

  get filteredItems(): Item[] {
    const keyword = this.normalize(this.searchTerm);

    return this.items.filter((entry) => {
      if (this.onlyPopular && entry.popular !== 'Yes') return false;
      if (keyword && !this.normalize(entry.name).includes(keyword)) return false;
      return true;
    });
  }

  get tableTitle(): string {
    if (this.onlyPopular) return 'Popular Goods';
    if (this.searchTerm) return `Search goods: ${this.searchTerm}`;
    return 'All Goods List';
  }

  get totalItems(): number {
    return this.items.length;
  }

  get totalValue(): number {
    return this.items.reduce((sum, entry) => sum + entry.quantity * entry.price, 0);
  }

  get lowOrOutCount(): number {
    return this.items.filter((entry) => entry.stockStatus === 'Low Stock' || entry.stockStatus === 'Out of Stock').length;
  }

  addItem(): void {
    const next = this.normalizeItem(this.formItem);
    const message = this.validate(next);
    if (message) {
      this.showUiMessage(message, true);
      return;
    }

    const result = this.inventoryService.addItem(next);
    this.showUiMessage(result.message, !result.ok);
    if (result.ok) this.clearForm();
  }

  updateByName(): void {
    const targetName = this.editingName || this.formItem.name.trim();
    if (!targetName) {
      this.showUiMessage('Please input goods name you want update', true);
      return;
    }

    const next = this.normalizeItem(this.formItem);
    const message = this.validate(next);
    if (message) {
      this.showUiMessage(message, true);
      return;
    }

    const result = this.inventoryService.updateByName(targetName, next);
    this.showUiMessage(result.message, !result.ok);
    if (result.ok) this.clearForm();
  }

  deleteByName(): void {
    const targetName = this.formItem.name.trim();
    if (!targetName) {
      this.showUiMessage('Please input goods name you want delete', true);
      return;
    }

    if (!window.confirm(`Delete '${targetName}'?`)) return;

    const result = this.inventoryService.deleteByName(targetName);
    if (result.ok) {
      this.selectedIds.clear();
      this.clearForm();
    }

    this.showUiMessage(result.message, !result.ok);
  }

  editItem(item: Item): void {
    this.formItem = {
      ...item,
      comment: item.comment || ''
    };

    this.editingName = item.name;
    this.showUiMessage(`Now editing goods: ${item.name}`);
  }

  deleteItemRow(item: Item): void {
    if (!window.confirm(`Delete '${item.name}'?`)) return;

    const result = this.inventoryService.deleteByName(item.name);
    if (result.ok) {
      this.selectedIds.delete(item.id);
    }

    this.showUiMessage(result.message, !result.ok);
  }

  searchByName(): void {
    this.searchTerm = this.searchInput.trim();
    this.onlyPopular = false;
  }

  showPopularOnly(): void {
    this.searchInput = '';
    this.searchTerm = '';
    this.onlyPopular = true;
  }

  showAll(): void {
    this.searchInput = '';
    this.searchTerm = '';
    this.onlyPopular = false;
  }

  toggleOne(id: string, checked: boolean): void {
    if (checked) {
      this.selectedIds.add(id);
      return;
    }

    this.selectedIds.delete(id);
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectAll(checked: boolean): void {
    if (!checked) {
      this.selectedIds.clear();
      return;
    }

    this.filteredItems.forEach((entry) => this.selectedIds.add(entry.id));
  }

  isAllSelected(): boolean {
    const rows = this.filteredItems;
    return rows.length > 0 && rows.every((entry) => this.selectedIds.has(entry.id));
  }

  deleteSelected(): void {
    const selectedRows = this.items.filter((entry) => this.selectedIds.has(entry.id));
    if (selectedRows.length === 0) {
      this.showUiMessage('No goods selected', true);
      return;
    }

    if (!window.confirm(`Delete ${selectedRows.length} selected goods?`)) return;

    selectedRows.forEach((entry) => this.inventoryService.deleteByName(entry.name));
    this.selectedIds.clear();
    this.showUiMessage(`Deleted ${selectedRows.length} selected goods`);
  }

  clearForm(): void {
    this.formItem = this.createEmptyForm();
    this.editingName = '';
  }

  private createEmptyForm(): Item {
    return {
      id: '',
      name: '',
      category: 'Electronics',
      quantity: 0,
      price: 0,
      supplier: '',
      stockStatus: 'In Stock',
      popular: 'No',
      comment: ''
    };
  }

  private validate(item: Item): string | null {
    if (!item.id.trim()) return 'Please input goods ID';
    if (!item.name.trim()) return 'Please input goods name';
    if (!Number.isFinite(item.quantity) || item.quantity < 0) return 'Quantity must be 0 or bigger';
    if (!Number.isFinite(item.price) || item.price < 0) return 'Price must be 0 or bigger';
    if (!item.supplier.trim()) return 'Please input supplier name';
    return null;
  }

  private normalizeItem(item: Item): Item {
    return {
      ...item,
      id: item.id.trim(),
      name: item.name.trim(),
      supplier: item.supplier.trim(),
      comment: item.comment?.trim() || ''
    };
  }

  private normalize(text: string): string {
    return text.trim().toLowerCase();
  }

  private showUiMessage(message: string, isError = false): void {
    this.uiMessage = message;
    this.uiMessageIsError = isError;

    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
    }

    this.timerId = window.setTimeout(() => {
      this.uiMessage = '';
      this.timerId = null;
    }, 3000);
  }
}
