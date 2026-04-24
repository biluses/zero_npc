'use strict';

const { ZodError } = require('zod');
const { ValidationError } = require('../utils/errors');

function formatZodError(err) {
  return err.issues.map((i) => ({ path: i.path.join('.'), message: i.message, code: i.code }));
}

function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      return next();
    } catch (err) {
      if (err instanceof ZodError) return next(new ValidationError(formatZodError(err)));
      return next(err);
    }
  };
}

module.exports = { validate };
