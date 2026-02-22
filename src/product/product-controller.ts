import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { Product } from "./product-types";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            name,
            description,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as Product;

        const image = req.body.image as string;

        // form-data sends these as strings — parse them to objects
        const priceConfiguration = JSON.parse(
            req.body.priceConfiguration as string,
        );
        const attributes = JSON.parse(req.body.attributes as string);

        const product = await this.productService.create({
            name,
            description,
            image,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        });

        this.logger.info(`Created product`, { id: product._id });
        res.json({ id: product._id });
    }
}