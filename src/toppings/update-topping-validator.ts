import { body } from "express-validator";

export default [
    body("name")
        .optional()
        .isString()
        .withMessage("Topping name should be a string"),
    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price should be a non-negative number"),
    body("tenantId")
        .optional()
        .isString()
        .withMessage("Tenant id should be a string"),
    body("categoryId")
        .optional()
        .isString()
        .withMessage("Category id should be a string"),
    body("isPublish")
        .optional()
        .isBoolean()
        .withMessage("isPublish should be a boolean"),
];
