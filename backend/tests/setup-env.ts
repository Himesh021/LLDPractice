process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/lld_practice_test";
process.env.FEEDBACK_PROVIDER = "mock";
process.env.CORS_ORIGIN = "http://localhost:5173";
