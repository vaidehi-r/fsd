/**
 * Joi validation middleware factory.
 * Validates req.body against the provided Joi schema.
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      return res.status(400).json({ message: messages });
    }

    req.body = value; // Use sanitized values
    next();
  };
};

/**
 * Validate query parameters.
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      return res.status(400).json({ message: messages });
    }

    req.query = value;
    next();
  };
};
