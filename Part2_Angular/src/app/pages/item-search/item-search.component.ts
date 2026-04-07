// WU Shaowei, PROG2005 A2 Part 2
import { Component } from '@angular/core';
import { Category, Item } from '../../models/item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  standalone: false,
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css']
})
export class ItemSearchComponent {
  categories: Array<Category | ''> = ['', 'Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];

  searchName = '';
  categoryFilter: Category | '' = '';
  onlyPopular = false;

  constructor(private readonly inventoryService: InventoryService) {}

  get filteredItems(): Item[] {
    const keyword = this.normalize(this.searchName);

    return this.inventoryService.getAll().filter((entry) => {
      if (keyword && !this.normalize(entry.name).includes(keyword)) return false;
      if (this.categoryFilter && entry.category !== this.categoryFilter) return false;
      if (this.onlyPopular && entry.popular !== 'Yes') return false;
      return true;
    });
  }

  reset(): void {
    this.searchName = '';
    this.categoryFilter = '';
    this.onlyPopular = false;
  }

  private normalize(text: string): string {
    return text.trim().toLowerCase();
  }
}
