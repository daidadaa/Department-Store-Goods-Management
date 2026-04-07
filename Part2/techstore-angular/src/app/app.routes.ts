import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'inventory', loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
  { path: 'search', loadComponent: () => import('./search/search.component').then(m => m.SearchComponent) },
  { path: 'privacy', loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'help', loadComponent: () => import('./help/help.component').then(m => m.HelpComponent) }
];