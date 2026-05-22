export interface Topping {
    name: string;
    image: string;
    price: number;
    tenantId: string;
    isPublish?: boolean;
}

export interface ToppingFilter {
    tenantId?: string;
    isPublish?: boolean;
    q?: string;
}

export interface PaginationQuery {
    page: number;
    limit: number;
}
