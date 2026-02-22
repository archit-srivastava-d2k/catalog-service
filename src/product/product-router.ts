import express from "express";
import multer from "multer";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import { ProductService } from "./product-service";
import createProductValidator from "./create-product-validator";
import logger from "../config/logger";

const router = express.Router();
const upload = multer();

const productService = new ProductService();
const productController = new ProductController(productService, logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    upload.none(), // parses multipart/form-data text fields
    createProductValidator,
    asyncWrapper(productController.create),
);

export default router;