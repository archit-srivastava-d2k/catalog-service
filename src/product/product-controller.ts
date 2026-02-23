import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { Product } from "./product-types";
import { uploadToCloudinary } from "../common/services/cloudinaryStorage";

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

        // Upload image to Cloudinary
        if (!req.file) {
            return next(createHttpError(400, "Product image file is required"));
        }

        let imageUrl: string;
        try {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                req.file.mimetype,
            );
            imageUrl = uploadResult.secure_url;
            this.logger.info(`Image uploaded to Cloudinary`, {
                publicId: uploadResult.public_id,
            });
        } catch (err) {
            return next(
                createHttpError(500, "Failed to upload image to Cloudinary"),
            );
        }

        // form-data sends these as strings — parse them to objects
        const priceConfiguration = JSON.parse(
            req.body.priceConfiguration as string,
        );
        const attributes = JSON.parse(req.body.attributes as string);

        const product = await this.productService.create({
            name,
            description,
            image: imageUrl,
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