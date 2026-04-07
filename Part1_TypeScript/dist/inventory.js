"use strict";
const categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
const stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
const popularValues = ['Yes', 'No'];
let items = [];
let searchTerm = '';
let onlyPopular = false;
let editingName = '';
const messageArea = document.getElementById('messageArea');
const itemIdInput = document.getElementById('itemId');
const itemNameInput = document.getElementById('itemName');
const categorySelect = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const supplierInput = document.getElementById('supplier');
const stockStatusSelect = document.getElementById('stockStatus');
const popularSelect = document.getElementById('popular');
const commentInput = document.getElementById('comment');
const searchInput = document.getElementById('searchInput');
const selectAllInput = document.getElementById('selectAll');
const inventoryBody = document.getElementById('inventoryBody');
const tableTitle = document.getElementById('tableTitle');
const totalItems = document.getElementById('totalItems');
const totalValue = document.getElementById('totalValue');
const lowStockCount = document.getElementById('lowStockCount');
function showMessage(message, isError = false) {
    messageArea.innerHTML = `<span style="color:${isError ? '#b91c1c' : '#166534'}">${message}</span>`;
    window.setTimeout(() => {
        messageArea.innerHTML = '';
    }, 2500);
}
function addOption(select, text) {
    const option = document.createElement('option');
    option.text = text;
    option.value = text;
    select.add(option);
}
function populateDropdowns() {
    categorySelect.innerHTML = '';
    stockStatusSelect.innerHTML = '';
    popularSelect.innerHTML = '';
    categories.forEach((item) => addOption(categorySelect, item));
    stockStatuses.forEach((item) => addOption(stockStatusSelect, item));
    popularValues.forEach((item) => addOption(popularSelect, item));
    categorySelect.value = 'Electronics';
    stockStatusSelect.value = 'In Stock';
    popularSelect.value = 'No';
}
// Shared form parser for add/update.
function getFormData() {
    return {
        id: itemIdInput.value.trim(),
        name: itemNameInput.value.trim(),
        category: categorySelect.value,
        quantity: Number(quantityInput.value),
        price: Number(priceInput.value),
        supplier: supplierInput.value.trim(),
        stockStatus: stockStatusSelect.value,
        popular: popularSelect.value,
        comment: commentInput.value.trim() || undefined
    };
}
// Required fields and unique ID check.
function validateItem(item, mode, currentIndex = -1) {
    if (!item.id)
        return (showMessage('Please input goods ID', true), false);
    if (!item.name)
        return (showMessage('Please input goods name', true), false);
    const qtyRaw = quantityInput.value.trim();
    if (qtyRaw === '' || Number.isNaN(item.quantity) || item.quantity < 0) {
        return (showMessage('Quantity must be 0 or bigger', true), false);
    }
    const priceRaw = priceInput.value.trim();
    if (priceRaw === '' || Number.isNaN(item.price) || item.price < 0) {
        return (showMessage('Price must be 0 or bigger', true), false);
    }
    if (!item.supplier)
        return (showMessage('Please input supplier name', true), false);
    const duplicateId = items.findIndex((x) => x.id.toLowerCase() === item.id.toLowerCase());
    if (mode === 'add' && duplicateId !== -1)
        return (showMessage('This goods ID already exists', true), false);
    if (mode === 'update' && duplicateId !== -1 && duplicateId !== currentIndex) {
        return (showMessage('This goods ID belongs to other goods', true), false);
    }
    return true;
}
function clearForm() {
    itemIdInput.value = '';
    itemNameInput.value = '';
    quantityInput.value = '';
    priceInput.value = '';
    supplierInput.value = '';
    commentInput.value = '';
    categorySelect.value = 'Electronics';
    stockStatusSelect.value = 'In Stock';
    popularSelect.value = 'No';
    editingName = '';
}
function updateStats() {
    totalItems.textContent = String(items.length);
    const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalValue.textContent = value.toFixed(2);
    const lowOrOut = items.filter((item) => item.stockStatus === 'Low Stock' || item.stockStatus === 'Out of Stock').length;
    lowStockCount.textContent = String(lowOrOut);
}
function filteredItems() {
    let output = [...items];
    if (onlyPopular)
        output = output.filter((item) => item.popular === 'Yes');
    if (searchTerm)
        output = output.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return output;
}
function escapeHtml(text) {
    // Escape ID before using in HTML attribute.
    return text.replace(/[&<>"]/g, (char) => {
        if (char === '&')
            return '&amp;';
        if (char === '<')
            return '&lt;';
        if (char === '>')
            return '&gt;';
        return '&quot;';
    });
}
function renderTable(data) {
    inventoryBody.innerHTML = '';
    data.forEach((item) => {
        const row = inventoryBody.insertRow();
        const checkCell = row.insertCell();
        checkCell.innerHTML = `<input type="checkbox" class="row-check" data-id="${escapeHtml(item.id)}" ${item.selected ? 'checked' : ''} />`;
        row.insertCell().textContent = item.id;
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.category;
        row.insertCell().textContent = String(item.quantity);
        row.insertCell().textContent = `$${item.price.toFixed(2)}`;
        row.insertCell().textContent = item.supplier;
        const stockCell = row.insertCell();
        stockCell.textContent = item.stockStatus;
        if (item.stockStatus === 'Low Stock')
            stockCell.className = 'stock-low';
        if (item.stockStatus === 'Out of Stock')
            stockCell.className = 'stock-out';
        row.insertCell().textContent = item.popular;
        row.insertCell().textContent = item.comment || '-';
        const actionCell = row.insertCell();
        actionCell.className = 'action-cell';
        actionCell.innerHTML = `
      <button class="edit-btn" data-id="${escapeHtml(item.id)}">Edit</button>
      <button class="delete-btn danger" data-id="${escapeHtml(item.id)}">Delete</button>
    `;
    });
    selectAllInput.checked = data.length > 0 && data.every((item) => item.selected);
    bindRowEvents();
}
function refreshView() {
    renderTable(filteredItems());
    updateStats();
    if (onlyPopular)
        tableTitle.textContent = 'Popular Goods';
    else if (searchTerm)
        tableTitle.textContent = `Search goods: ${searchTerm}`;
    else
        tableTitle.textContent = 'All Goods List';
}
function addItem() {
    const item = getFormData();
    if (!validateItem(item, 'add'))
        return;
    const duplicateName = items.some((x) => x.name.toLowerCase() === item.name.toLowerCase());
    if (duplicateName)
        return showMessage('This goods name already in list', true);
    items.push(item);
    clearForm();
    refreshView();
    showMessage(`Add success: ${item.name}`);
}
// Assignment rule: update by item name.
function updateByName() {
    const targetName = editingName || itemNameInput.value.trim();
    if (!targetName)
        return showMessage('Please input goods name you want update', true);
    const index = items.findIndex((x) => x.name.toLowerCase() === targetName.toLowerCase());
    if (index === -1)
        return showMessage('Can not find this goods', true);
    const next = getFormData();
    if (!validateItem(next, 'update', index))
        return;
    const duplicateName = items.findIndex((x) => x.name.toLowerCase() === next.name.toLowerCase());
    if (duplicateName !== -1 && duplicateName !== index) {
        return showMessage('This goods name belongs to other goods', true);
    }
    items[index] = { ...next, selected: items[index].selected };
    clearForm();
    refreshView();
    showMessage(`Update success: ${targetName}`);
}
function deleteByName() {
    const targetName = itemNameInput.value.trim();
    if (!targetName)
        return showMessage('Please input goods name you want delete', true);
    const index = items.findIndex((item) => item.name.toLowerCase() === targetName.toLowerCase());
    if (index === -1)
        return showMessage('Can not find this goods', true);
    const ok = window.confirm(`Delete '${items[index].name}'?`);
    if (!ok)
        return;
    const deleted = items[index];
    items.splice(index, 1);
    clearForm();
    refreshView();
    showMessage(`Delete success: ${deleted.name}`);
}
function deleteSelected() {
    const selected = items.filter((item) => item.selected);
    if (selected.length === 0)
        return showMessage('Please select at least one goods', true);
    const ok = window.confirm(`Delete ${selected.length} selected goods?`);
    if (!ok)
        return;
    items = items.filter((item) => !item.selected);
    refreshView();
    showMessage(`Deleted ${selected.length} selected goods`);
}
function searchByName() {
    searchTerm = searchInput.value.trim();
    onlyPopular = false;
    refreshView();
}
function showPopularOnly() {
    searchTerm = '';
    searchInput.value = '';
    onlyPopular = true;
    refreshView();
}
function showAll() {
    searchTerm = '';
    searchInput.value = '';
    onlyPopular = false;
    refreshView();
}
function bindRowEvents() {
    // Rebind row events after table re-render.
    document.querySelectorAll('.row-check').forEach((node) => {
        node.addEventListener('change', (event) => {
            const id = event.target.dataset.id || '';
            const checked = event.target.checked;
            const target = items.find((item) => item.id === id);
            if (target)
                target.selected = checked;
        });
    });
    document.querySelectorAll('.edit-btn').forEach((node) => {
        node.addEventListener('click', (event) => {
            const id = event.target.dataset.id || '';
            const target = items.find((item) => item.id === id);
            if (!target)
                return;
            itemIdInput.value = target.id;
            itemNameInput.value = target.name;
            categorySelect.value = target.category;
            quantityInput.value = String(target.quantity);
            priceInput.value = String(target.price);
            supplierInput.value = target.supplier;
            stockStatusSelect.value = target.stockStatus;
            popularSelect.value = target.popular;
            commentInput.value = target.comment || '';
            editingName = target.name;
            showMessage(`Editing goods: ${target.name}`);
        });
    });
    document.querySelectorAll('.delete-btn').forEach((node) => {
        node.addEventListener('click', (event) => {
            const id = event.target.dataset.id || '';
            const index = items.findIndex((item) => item.id === id);
            if (index === -1)
                return;
            const ok = window.confirm(`Delete '${items[index].name}'?`);
            if (!ok)
                return;
            const deleted = items[index];
            items.splice(index, 1);
            refreshView();
            showMessage(`Delete success: ${deleted.name}`);
        });
    });
    selectAllInput.onchange = (event) => {
        const checked = event.target.checked;
        filteredItems().forEach((item) => {
            const source = items.find((x) => x.id === item.id);
            if (source)
                source.selected = checked;
        });
        refreshView();
    };
}
// Sample records for first load.
function seedData() {
    items = [
        {
            id: 'E1001',
            name: 'MacBook Pro',
            category: 'Electronics',
            quantity: 5,
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
            popular: 'No',
            comment: 'Back support model'
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
}
function bindTopEvents() {
    document.getElementById('submitBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        addItem();
    });
    document.getElementById('updateBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        updateByName();
    });
    document.getElementById('deleteBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        deleteByName();
    });
    document.getElementById('clearBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        clearForm();
    });
    document.getElementById('searchBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        searchByName();
    });
    document.getElementById('resetSearchBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        showAll();
    });
    document.getElementById('showAllBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        showAll();
    });
    document.getElementById('showPopularBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        showPopularOnly();
    });
    document.getElementById('batchDeleteBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        deleteSelected();
    });
}
function init() {
    populateDropdowns();
    seedData();
    bindTopEvents();
    refreshView();
}
init();
