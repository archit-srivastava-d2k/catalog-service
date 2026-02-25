import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { Product } from "./product-types";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
    extractCloudinaryPublicId,
} from "../common/services/cloudinaryStorage";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
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

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;

        // Verify product exists
        const existingProduct =
            await this.productService.getById(productId);
        if (!existingProduct) {
            return next(createHttpError(404, "Product not found"));
        }

        // Tenant authorization — managers can only update their own tenant's products
        const authReq = req as unknown as AuthRequest;
        if (authReq.auth.role === Roles.MANAGER) {
            if (existingProduct.tenantId !== authReq.auth.tenant?.id) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to update this product",
                    ),
                );
            }
        }

        // Build partial update payload
        const {
            name,
            description,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as Partial<Product>;

        let imageUrl: string | undefined;

        // Only upload new image if a file was provided
        if (req.file) {
            // Delete the old image from Cloudinary before uploading the new one
            if (existingProduct.image) {
                const oldPublicId = extractCloudinaryPublicId(
                    existingProduct.image,
                );
                if (oldPublicId) {
                    try {
                        await deleteFromCloudinary(oldPublicId);
                        this.logger.info(`Deleted old image from Cloudinary`, {
                            publicId: oldPublicId,
                        });
                    } catch (err) {
                        // Log but don't block the update if deletion fails
                        this.logger.warn(
                            `Failed to delete old image from Cloudinary`,
                            { publicId: oldPublicId, err },
                        );
                    }
                }
            }

            try {
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    req.file.mimetype,
                );
                imageUrl = uploadResult.secure_url;
                this.logger.info(`Image updated on Cloudinary`, {
                    publicId: uploadResult.public_id,
                });
            } catch (err) {
                return next(
                    createHttpError(
                        500,
                        "Failed to upload image to Cloudinary",
                    ),
                );
            }
        }

        const priceConfiguration = req.body.priceConfiguration
            ? JSON.parse(req.body.priceConfiguration as string)
            : undefined;

        const attributes = req.body.attributes
            ? JSON.parse(req.body.attributes as string)
            : undefined;

        const updatePayload: Partial<Product> = {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(tenantId !== undefined && { tenantId }),
            ...(categoryId !== undefined && { categoryId }),
            ...(isPublish !== undefined && { isPublish }),
            ...(imageUrl !== undefined && { image: imageUrl }),
            ...(priceConfiguration !== undefined && { priceConfiguration }),
            ...(attributes !== undefined && { attributes }),
        };

        const updated = await this.productService.update(
            productId,
            updatePayload,
        );

        this.logger.info(`Updated product`, { id: updated?._id });
        res.json({ id: updated?._id });
    }
}