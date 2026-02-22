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
    categoryId: string;
    isPublish?: boolean;
}
