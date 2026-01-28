export const API_BASE_URL = '/api';

export const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;
