import { env } from 'next-runtime-env';

export const BACKEND_API_URL = env('NEXT_PUBLIC_API_URL');
export const BACKEND_WS_URL = env('NEXT_PUBLIC_WS_URL'); 