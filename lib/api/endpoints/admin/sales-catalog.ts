import { httpClient } from '../../httpClient';

export interface PhoneSellingPrice {
  id: string;
  categoryId: string;
  phoneModelId: string;
  model: string;
  storage: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneSaleCategory {
  id: string;
  key: string;
  label: string;
  description?: string;
  imagePath?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  prices: PhoneSellingPrice[];
}

export interface CreateSalesCatalogRequest {
  categoryId: string;
  phoneModelId: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateSalesCatalogRequest {
  price?: number;
  isActive?: boolean;
}

export interface CreateSaleCategoryRequest {
  key: string;
  label: string;
  description?: string;
  imagePath?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSaleCategoryRequest {
  label?: string;
  description?: string;
  imagePath?: string;
  isActive?: boolean;
  order?: number;
}

// Sales Catalog (prices)
export async function getSalesCatalog(includeInactive = false) {
  const query = includeInactive ? '?admin=1' : '';
  return httpClient.get<PhoneSaleCategory[]>(`/api/admin/sales-catalog${query}`);
}

export async function getSalesCatalogItem(id: string) {
  return httpClient.get<PhoneSellingPrice>(`/api/admin/sales-catalog/${id}`);
}

export async function createSalesCatalogItem(payload: CreateSalesCatalogRequest) {
  return httpClient.post<PhoneSellingPrice, CreateSalesCatalogRequest>('/api/admin/sales-catalog', payload);
}

export async function updateSalesCatalogItem(id: string, payload: UpdateSalesCatalogRequest) {
  return httpClient.patch<PhoneSellingPrice, UpdateSalesCatalogRequest>(`/api/admin/sales-catalog/${id}`, payload);
}

export async function deleteSalesCatalogItem(id: string) {
  return httpClient.delete(`/api/admin/sales-catalog/${id}`);
}

// Sale Categories
export async function getSaleCategories() {
  return httpClient.get<PhoneSaleCategory[]>('/api/admin/sale-categories');
}

export async function getSaleCategory(id: string) {
  return httpClient.get<PhoneSaleCategory>(`/api/admin/sale-categories/${id}`);
}

export async function createSaleCategory(payload: CreateSaleCategoryRequest) {
  return httpClient.post<PhoneSaleCategory, CreateSaleCategoryRequest>('/api/admin/sale-categories', payload);
}

export async function updateSaleCategory(id: string, payload: UpdateSaleCategoryRequest) {
  return httpClient.patch<PhoneSaleCategory, UpdateSaleCategoryRequest>(`/api/admin/sale-categories/${id}`, payload);
}
