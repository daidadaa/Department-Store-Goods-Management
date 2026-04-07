// WU Shaowei, PROG2005 A2 Part 2
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { ItemSearchComponent } from './pages/item-search/item-search.component';
import { PrivacySecurityComponent } from './pages/privacy-security/privacy-security.component';
import { HelpComponent } from './pages/help/help.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InventoryManagementComponent,
    ItemSearchComponent,
    PrivacySecurityComponent,
    HelpComponent
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
