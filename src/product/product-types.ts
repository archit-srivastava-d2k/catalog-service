import mongoose from "mongoose";

export interface PriceConfiguration {
    [key: string]: {
        priceType: "base" | "additional";
        availableOptions: { [key: string]: number };
    };
}

export interface AttributeValue {
    name: string;
    value: string | boolean;
}

export interface Product {
    name: string;
    description: string;
    image: string;
    priceConfiguration: PriceConfiguration;
    attributes: AttributeValue[];
    tenantId: string;
    categoryId: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface ProductFilter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
    q?: string;
}

export interface PaginationQuery {
    page: number;
    limit: number;
}
