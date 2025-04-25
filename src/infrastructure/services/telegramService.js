// src/infrastructure/services/telegramService.js
import fetch from 'node-fetch';
import { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } from '../config/index.js';

class TelegramService {
  /**
   * Envía un mensaje de texto al chat configurado.
   * @param {string} text      – El contenido del mensaje (HTML).
   * @param {string} [mode]    – El parse_mode, por defecto "HTML".
   */
  async sendMessage(text, mode = 'HTML') {
    try {
      console.log(`[TelegramService] Enviando mensaje con parse_mode=${mode}`);
      const res = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            chat_id:    TELEGRAM_CHAT_ID,
            text,
            parse_mode: mode
          })
        }
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.description || 'Error desconocido de Telegram');
      console.log('[TelegramService] Mensaje enviado con éxito, message_id:', data.result.message_id);
      return data;
    } catch (error) {
      console.error('[TelegramService] Falló el envío de mensaje:', error);
      throw error;
    }
  }
}

export const telegramService = new TelegramService();
