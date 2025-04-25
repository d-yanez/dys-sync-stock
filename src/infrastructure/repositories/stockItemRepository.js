import { StockItemModel } from '../models/stockItemModel.js';

class StockItemRepository {
  /**
   * Inserta o actualiza en bulk un array de items.
   * @param {Array<{ sku: Number, title: String, stock: Number, location: String }>} items
   * @returns {Promise<Object>} Resultado de bulkWrite
   */
  async bulkUpsert(items) {
    console.log(`[StockItemRepository] bulkUpsert iniciado con ${items.length} ítems`);
    const operations = items.map(item => ({
      updateOne: {
        filter: { sku: item.sku, location: item.location },
        update: {
          $set: {
            title:      item.title,
            stock:      item.stock,
            location:   item.location,
            lastUpdate: new Date()
          }
        },
        upsert: true
      }
    }));

    const result = await StockItemModel.bulkWrite(operations, { ordered: false });

    console.log(
      `[StockItemRepository] bulkUpsert completado → matched: ${result.matchedCount}, ` +
      `modified: ${result.modifiedCount}, upserted: ${result.upsertedCount}`
    );
    return result;
  }

  /**
   * Obtiene la suma total de todo el stock.
   * Útil para cálculo de variación global.
   * @returns {Promise<Number>}
   */
  async getTotalStock() {
    console.log('[StockItemRepository] Calculando total de stock...');
    const agg = await StockItemModel.aggregate([
      { $group: { _id: null, total: { $sum: '$stock' } } }
    ]);
    const total = agg[0]?.total || 0;
    console.log(`[StockItemRepository] Total de stock: ${total}`);
    return total;
  }
}

export const stockItemRepository = new StockItemRepository();
