/**
 * Recibe un array de errores y los registra en logs.
 * Cada elemento: { row: Number, message: String }
 */
export const reviewController = {
    handle(req, res) {
      const errors = req.body;
      errors.forEach(err => {
        console.warn(`Fila ${err.row} tiene la siguiente observación: ${err.message}`);
      });
      return res.json({ success: true, count: errors.length });
    }
  };
  