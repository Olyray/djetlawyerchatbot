// import 'dotenv/config'
console.log(`NEXT Public backend URL - ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
export const API_BASE_URL = process.env.NODE_ENV == 'production'
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : 'http://127.0.0.1:8000';