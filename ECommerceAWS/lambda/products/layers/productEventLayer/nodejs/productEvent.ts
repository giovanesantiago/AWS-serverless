export enum ProductEventType {
    CREATED = "PRODUCT_CREATED",
    UPDATED = "PRODUCT_UPDATED",
    DELETE = "PRODUCT_DELETE"
}

export interface ProductEvent {
    requestId: string;
    eventType: ProductEventType;
    productId: string;
    productCode: string;
    productPrice: number;
    email: string;
}