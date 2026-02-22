import ProductModel from "./product-model";
import { Product } from "./product-types";

export class ProductService {
    async create(product: Product) {
        const newProduct = new ProductModel(product);
        return newProduct.save();
    }
}
