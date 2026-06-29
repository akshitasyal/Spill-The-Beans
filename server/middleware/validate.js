// ============================================================
//  validate.js — Zod request validation middleware
// ============================================================

/**
 * Middleware factory that validates a request property against a Zod schema.
 *
 * @param {ZodSchema} schema  - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} target - Which part of the request to validate
 *
 * @example
 *   router.post('/', validate(addCartItemSchema, 'body'), CartController.addItem);
 */
export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.flatten();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.fieldErrors,
      });
    }
    // Replace with parsed & coerced data
    req[target] = result.data;
    next();
  };
}
