import dotenv from 'dotenv';

dotenv.config();

export const API_BASE_URL = process.env.PRODUCTION === 'True'
  ? 'https://chatbotbackend-d5335f7520bc.herokuapp.com'
  : 'http://127.0.0.1:8000';