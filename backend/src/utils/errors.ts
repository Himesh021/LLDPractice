export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(500, message, "CONFIGURATION_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code = "EXTERNAL_SERVICE_ERROR") {
    super(502, message, code);
  }
}
