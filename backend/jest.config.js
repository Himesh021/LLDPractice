module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testTimeout: 60000,
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
};
