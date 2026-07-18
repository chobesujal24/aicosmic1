export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const suggestions = [
  "Explain quantum computing in simple terms",
  "Write a Python script for a web scraper",
  "Help me brainstorm startup ideas for AI",
  "What are the latest trends in web development?",
];
