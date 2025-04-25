import dotenv from 'dotenv';

// Con override: las variables de .env reemplazan a las que ya estén en process.env
dotenv.config({ override: true });

export const {
  MONGODB_URI,
  SPREADSHEET_ID,
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  PORT = 8080
} = process.env;
