import { Company } from "../pages/Companies/types";

export interface ProductId {
  sku: string;
  companyId: string;
}

export interface ProductWarehouseQuantityId {
  productId: ProductId;
  warehouseId: string;
}

export interface ProductWarehouseQuantity {
  id: ProductWarehouseQuantityId;
  itemLocation: string;
  quantity: number;
  reserved?: number;
  readyToDeliver?: number;
  warehouseId: string;
}

export interface ProductResponse {
  productId: ProductId;
  id: string;
  sku: string;
  name: string;
  category: string;
  ean: string;
  weight: number;
  orderedQuantity: number;
  productWarehouseQuantities: ProductWarehouseQuantity[];
}

export interface FormProduct extends Omit<ProductResponse, "id"> {
  id: string;
  company: Company;
}

export interface ProductSubmit extends Omit<ProductResponse, "id"> {
  companyId: string;
  createdBy: string;
}
