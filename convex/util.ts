import { ApiClient } from "@damn-fun/sdk";

export function getApiClient() {
  const baseUrl = process.env.SDK_BASE_URL;
  const apiKey = process.env.SDK_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("SDK_BASE_URL and SDK_API_KEY must be set");
  }
  return new ApiClient({ baseUrl, apiKey });
}
