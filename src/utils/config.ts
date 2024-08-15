// import dotenv from 'dotenv';

// if (process.env.NODE_ENV !== 'production') {
//   dotenv.config();
// }

export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://chatbotbackend-d5335f7520bc.herokuapp.com'
  : 'http://127.0.0.1:8000';