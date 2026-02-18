// src/useCases/syncStockUseCase.js

export const makeSyncStockUseCase = ({ 
    stockItemRepository, 
    summaryChangeRepository, 
    googleSheetsService 
  }) => ({
    async execute() {
      console.log(`[SyncStock] Inicio: ${new Date().toISOString()}`);
  
      const allRows = await googleSheetsService.readSheet('rev_stock_full!A1:R');
      const header   = allRows[0] || [];
      const dataRows = allRows.slice(1);
  
      const idx = name => {
        const i = header.indexOf(name);
        if (i === -1) throw new Error(`Columna "${name}" no existe`);
        return i;
      };
      const iSku        = idx('sku');
      const iStockTotal = idx('stock_total');
      const iLocation   = idx('id_caja');
      const iTitle      = idx('titulo');
  
      const normalizeCell = value => (value == null ? '' : String(value).trim());
      const seen       = new Set();
      const itemsBySku = new Map();
      const errors     = [];
  
      dataRows.forEach((row, i) => {
        const excelRow = i + 2;
        const rawSku   = normalizeCell(row[iSku]);
        const rawStock = normalizeCell(row[iStockTotal]);
        const rawLoc   = normalizeCell(row[iLocation]);

        if (!rawSku) {
          errors.push({ row: excelRow, message: 'SKU vacío' });
          return;
        }
        if (!rawStock || isNaN(Number(rawStock))) {
          errors.push({ row: excelRow, message: 'stock_total no es numérico o está vacío' });
          return;
        }
        if (!rawLoc) {
          errors.push({ row: excelRow, message: 'id_caja vacío' });
          return;
        }
        const key = `${rawSku}|${rawLoc}`;
        if (seen.has(key)) {
          errors.push({ row: excelRow, message: 'Duplicado de SKU+id_caja' });
          return;
        }
        seen.add(key);
  
        const item = {
          sku:      Number(rawSku),
          title:    normalizeCell(row[iTitle]),
          stock:    Number(rawStock),
          location: rawLoc
        };
        if (!itemsBySku.has(item.sku)) {
          itemsBySku.set(item.sku, []);
        }
        itemsBySku.get(item.sku).push(item);
      });

      const totalItems = Array.from(itemsBySku.values()).reduce((acc, items) => acc + items.length, 0);
      console.log(`[SyncStock] Válidos: ${totalItems}, ignorados: ${errors.length}`);

      // Reemplazo total por SKU (Sheets es fuente de verdad)
      const skusInSheet = Array.from(itemsBySku.keys());
      if (skusInSheet.length === 0) {
        console.warn('[SyncStock] Snapshot vacío; se omite deleteNotInSkus para evitar borrado total.');
      } else {
        await stockItemRepository.deleteNotInSkus(skusInSheet);
      }
      for (const [sku, items] of itemsBySku) {
        await stockItemRepository.replaceBySku(sku, items);
      }
  
      // Cálculo de variación global (contra el último resumen guardado)
      const currentTotal = await stockItemRepository.getTotalStock();
      const lastSummary = await summaryChangeRepository.getLast();
      const previousTotal = lastSummary?.current ?? currentTotal;
      const percentualChange = previousTotal === 0
        ? 0
        : ((currentTotal - previousTotal) / previousTotal) * 100;
  
      // Guardar resumen
      const now = new Date();
      const dateNum = Number(
        `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}` +
        `${String(now.getDate()).padStart(2,'0')}` +
        `${String(now.getHours()).padStart(2,'0')}` +
        `${String(now.getMinutes()).padStart(2,'0')}` +
        `${String(now.getSeconds()).padStart(2,'0')}`
      );
      await summaryChangeRepository.insert({
        date:             dateNum,
        previous:         previousTotal,
        current:          currentTotal,
        percentualChange
      });
  
      console.log('[SyncStock] Sincronización completada.');
      return { previousTotal, currentTotal, percentualChange, errors };
    }
  });
  
