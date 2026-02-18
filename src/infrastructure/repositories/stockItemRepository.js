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
   * Reemplaza completamente las ubicaciones de un SKU.
   * @param {Number} sku
   * @param {Array<{ sku: Number, title: String, stock: Number, location: String }>} items
   * @returns {Promise<Object>} Resultado de la inserción
   */
  async replaceBySku(sku, items) {
    console.log(`[StockItemRepository] replaceBySku iniciado para SKU ${sku} con ${items.length} ítems`);
    await StockItemModel.deleteMany({ sku });

    if (items.length === 0) {
      return { insertedCount: 0 };
    }

    const now = new Date();
    const docs = items.map(item => ({ ...item, lastUpdate: now }));
    const result = await StockItemModel.insertMany(docs, { ordered: false });
    console.log(`[StockItemRepository] replaceBySku completado → inserted: ${result.length}`);
    return result;
  }

  /**
   * Reemplaza completamente las ubicaciones de un conjunto de SKUs en una sola pasada.
   * @param {Number[]} skus
   * @param {Array<{ sku: Number, title: String, stock: Number, location: String }>} items
   * @returns {Promise<Object>} Resultado de la inserción
   */
  async replaceBySkus(skus, items) {
    console.log(
      `[StockItemRepository] replaceBySkus iniciado para ${skus.length} SKUs con ${items.length} ítems`
    );
    await StockItemModel.deleteMany({ sku: { $in: skus } });

    if (items.length === 0) {
      return { insertedCount: 0 };
    }

    const now = new Date();
    const docs = items.map(item => ({ ...item, lastUpdate: now }));
    const result = await StockItemModel.insertMany(docs, { ordered: false });
    console.log(`[StockItemRepository] replaceBySkus completado → inserted: ${result.length}`);
    return result;
  }

  /**
   * Elimina documentos cuyo SKU no esté en el snapshot actual.
   * @param {Number[]} skus
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteNotInSkus(skus) {
    const hasSkus = Array.isArray(skus) && skus.length > 0;
    const filter = hasSkus ? { sku: { $nin: skus } } : {};
    const result = await StockItemModel.deleteMany(filter);
    console.log(`[StockItemRepository] deleteNotInSkus completado → deleted: ${result.deletedCount}`);
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
