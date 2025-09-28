export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const defaultOptions = {
    ...options,
    credentials: 'include' as const, // Always send cookies
    headers: {
      ...options.headers,
    },
  };

  const response = await fetch(url, defaultOptions);

  // No authenticated user
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  return response;
};
