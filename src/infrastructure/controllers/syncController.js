// src/infrastructure/controllers/syncController.js
import { makeSyncStockUseCase }     from '../../useCases/syncStockUseCase.js';
import { stockItemRepository }      from '../repositories/stockItemRepository.js';
import { summaryChangeRepository }  from '../repositories/summaryChangeRepository.js';
import { readSheet }                from '../services/googleSheetsService.js';
import { telegramService }          from '../services/telegramService.js';
import { reviewController }         from './reviewController.js';

const syncUseCase = makeSyncStockUseCase({
  stockItemRepository,
  summaryChangeRepository,
  googleSheetsService: { readSheet }
});

export const syncController = {
  async handle(req, res) {
    console.log('[SyncController] POST /sync-stock recibido');

    // Ejecuta el use case
    let result;
    try {
      result = await syncUseCase.execute();
    } catch (error) {
      console.error('[SyncController] Error en useCase:', error);
      // Notificar error vía Telegram (igual que antes)…
      return res.status(500).json({ success: false, message: error.message });
    }

    const { previousTotal, currentTotal, percentualChange, errors, durationMs } = result;

    // 1) Si hay errores, llamar al controlador de revisión
    if (errors.length > 0) {
      console.log(`[SyncController] Registrando ${errors.length} errores de validación`);
      // Simulamos req/res para reviewController
      const fakeReq = { body: errors };
      const fakeRes = {
        json: () => {},    // no necesitamos manejar la respuesta
      };
      reviewController.handle(fakeReq, fakeRes);
    }

    // 2) Enviar resumen a Telegram
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ` +
                      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const htmlMsg =
      `<b>📊 Informe de Sync Stock</b>\n<pre>` +
      `Fecha:            ${timestamp}\n` +
      `Total anterior:   ${previousTotal}\n` +
      `Total actual:     ${currentTotal}\n` +
      `Variación diaria: ${percentualChange.toFixed(2)}%\n` +
      `Duración:         ${durationMs} ms` +
      `</pre>`;

    try {
      await telegramService.sendMessage(htmlMsg, 'HTML');
    } catch (telErr) {
      console.error('[SyncController] No se pudo notificar a Telegram:', telErr);
    }

    console.log(`[SyncController] Duración total: ${durationMs} ms`);
    return res.json({ success: true, previousTotal, currentTotal, percentualChange, durationMs, errorsCount: errors.length });
  }
};
