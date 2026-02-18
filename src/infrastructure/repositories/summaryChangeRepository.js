import { SummaryChangeModel } from '../models/summaryChangeModel.js';

class SummaryChangeRepository {
  /**
   * Inserta un documento de resumen de variación de stock.
   * @param {{ date: Number, previous: Number, current: Number, percentualChange: Number }} data
   * @returns {Promise} resultado de la inserción
   */
  async insert(data) {
    console.log('[SummaryChangeRepository] Insertando resumen:', data);
    const doc = new SummaryChangeModel(data);
    return await doc.save();
  }

  /**
   * Obtiene el último resumen guardado (por fecha descendente).
   * @returns {Promise<{ date: Number, previous: Number, current: Number, percentualChange: Number } | null>}
   */
  async getLast() {
    return await SummaryChangeModel.findOne({}).sort({ date: -1 }).lean();
  }
}

export const summaryChangeRepository = new SummaryChangeRepository();
