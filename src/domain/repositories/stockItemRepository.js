
/**
 * @typedef {Object} StockItemData
 * @property {String} stockItemId
 * @property {Number} sku
 * @property {String} title
 * @property {Number} stock
 * @property {String} location
 */

/**
 * Repositorio de StockItem (contrato).
 * @abstract
 */
export class StockItemRepository {
    /** @param {StockItemData[]} items */
    async bulkUpsert(items) {
      throw new Error('Método bulkUpsert no implementado');
    }
    /** @returns {Promise<Number>} */
    async getTotalStock() {
      throw new Error('Método getTotalStock no implementado');
    }
  }
  
