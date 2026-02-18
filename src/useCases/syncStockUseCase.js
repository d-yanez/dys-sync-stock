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
  
      const seen       = new Set();
      const validItems = [];
      const errors     = [];
  
      dataRows.forEach((row, i) => {
        const excelRow = i + 2;
        const rawSku   = row[iSku]?.trim();
        const rawStock = row[iStockTotal]?.trim();
        const rawLoc   = row[iLocation]?.trim();
  
        if (!rawSku || rawSku.length < 6) {
          errors.push({ row: excelRow, message: 'SKU vacío o menor a 6 caracteres' });
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
  
        validItems.push({
          sku:      Number(rawSku),
          title:    row[iTitle] || '',
          stock:    Number(rawStock),
          location: rawLoc
        });
      });
  
      console.log(`[SyncStock] Válidos: ${validItems.length}, ignorados: ${errors.length}`);
  
      // Bulk upsert
      await stockItemRepository.bulkUpsert(validItems);
  
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
  
