// src/infrastructure/services/googleSheetsService.js
import { google } from 'googleapis';
import { SPREADSHEET_ID } from '../config/index.js';

const authOptions = {
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
};

// En local usa el JSON; en Cloud Run usa ADC
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  authOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const auth = new google.auth.GoogleAuth(authOptions);

export const readSheet = async (range) => {
  console.log(`[GoogleSheetsService] Leyendo rango "${range}" de la hoja con ID ${SPREADSHEET_ID}...`);
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  const rows = res.data.values || [];
  console.log(`[GoogleSheetsService] Lectura completada: ${rows.length} filas obtenidas.`);
  return rows;
};
