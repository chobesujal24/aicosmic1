import { isTestEnvironment } from "../constants";

// In Puter mode, AI calls happen client-side via puter.ai.chat()
// These exports exist for backward compatibility with test environment
export const myProvider = isTestEnvironment
  ? (() => {
      const {
        chatModel,
        titleModel: mockTitleModel,
      } = require("./models.mock");
      const { customProvider } = require("ai");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }
  // In production, AI calls are made client-side via Puter.js
  // This function is only used for title generation as a fallback
  return null;
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return null;
}
