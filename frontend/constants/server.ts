const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_MODE === "debug") {
    return process.env.EXPO_PUBLIC_DEBUG_URL;
  }
  return process.env.EXPO_PUBLIC_PROD_URL;
};

export const BASE_URL = getBaseUrl();
