import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Topping name is required")
        .isString()
        .withMessage("Topping name should be a string"),
    body("price")
        .exists()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price should be a non-negative number"),
    body("tenantId")
        .exists()
        .withMessage("Tenant id is required")
        .isString()
        .withMessage("Tenant id should be a string"),
    body("categoryId")
        .optional()
        .isString()
        .withMessage("Category id should be a string"),
    // image is validated as req.file in the controller after multer processes it
];
