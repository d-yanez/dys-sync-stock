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
}

export const summaryChangeRepository = new SummaryChangeRepository();
