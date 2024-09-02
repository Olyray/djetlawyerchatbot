// import dotenv from 'dotenv';

// if (process.env.NODE_ENV !== 'production') {
//   dotenv.config();
// }

export const API_BASE_URL = process.env.NODE_ENV == 'production'
  ? 'https://staging-chatbotbackend-050d187727dc.herokuapp.com/'
  : 'http://127.0.0.1:8000';