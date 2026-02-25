import ProductModel from "./product-model";
import { Product } from "./product-types";

export class ProductService {
    async create(product: Product) {
        const newProduct = new ProductModel(product);
        return newProduct.save();
    }

    async update(productId: string, product: Partial<Product>) {
        return ProductModel.findByIdAndUpdate(
            productId,
            { $set: product },
            { new: true },
        );
    }

    async getById(productId: string) {
        return ProductModel.findById(productId);
    }
}
