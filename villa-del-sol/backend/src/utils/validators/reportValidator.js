import { check, query } from 'express-validator';

/**
 * Validaciones para los reportes del sistema Villa del Sol
 */
const reportValidator = {
    /**
     * Validación de rango de fechas para reportes
     * Verifica que las fechas startDate y endDate sean válidas
     */
    dateRangeValidation: [
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('La fecha inicial debe ser una fecha válida en formato ISO8601')
            .toDate(),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('La fecha final debe ser una fecha válida en formato ISO8601')
            .toDate()
            .custom((endDate, { req }) => {
                const startDate = req.query.startDate;
                if (startDate && endDate < new Date(startDate)) {
                    throw new Error('La fecha final debe ser posterior a la fecha inicial');
                }
                return true;
            })
    ],

    /**
     * Validación de mes y año para reportes mensuales
     */
    monthYearValidation: [
        query('month')
            .optional()
            .isInt({ min: 1, max: 12 })
            .withMessage('El mes debe ser un número entre 1 y 12'),
        query('year')
            .optional()
            .isInt({ min: 2000, max: 2100 })
            .withMessage('El año debe ser un número válido entre 2000 y 2100')
    ],

    /**
     * Validación para reportes personalizados
     * Verifica los parámetros específicos según el tipo de reporte
     */
    customReportValidation: [
        check('reportType')
            .notEmpty()
            .withMessage('El tipo de reporte es requerido')
            .isIn(['owners', 'payments', 'visitors', 'apartments'])
            .withMessage('Tipo de reporte inválido'),
        check('filters')
            .optional()
            .isObject()
            .withMessage('Los filtros deben ser un objeto válido'),
        check('format')
            .optional()
            .isIn(['pdf', 'excel', 'csv'])
            .withMessage('Formato de reporte inválido'),
        check('groupBy')
            .optional()
            .isIn(['day', 'week', 'month', 'year'])
            .withMessage('Agrupación inválida'),
        check('sortBy')
            .optional()
            .isString()
            .withMessage('El campo de ordenamiento debe ser una cadena válida'),
        check('sortOrder')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('El orden debe ser asc o desc')
    ],

    /**
     * Validación para filtros de propietarios en reportes
     */
    ownerFiltersValidation: [
        query('status')
            .optional()
            .isIn(['active', 'inactive'])
            .withMessage('Estado de propietario inválido'),
        query('hasDebt')
            .optional()
            .isBoolean()
            .withMessage('El indicador de deuda debe ser un booleano')
    ],

    /**
     * Validación para filtros de apartamentos en reportes
     */
    apartmentFiltersValidation: [
        query('status')
            .optional()
            .isIn(['occupied', 'unoccupied'])
            .withMessage('Estado de apartamento inválido'),
        query('block')
            .optional()
            .isString()
            .withMessage('El bloque debe ser una cadena válida')
    ],

    /**
     * Validación para filtros de pagos en reportes
     */
    paymentFiltersValidation: [
        query('status')
            .optional()
            .isIn(['pending', 'paid', 'overdue'])
            .withMessage('Estado de pago inválido'),
        query('minAmount')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('El monto mínimo debe ser un número positivo'),
        query('maxAmount')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('El monto máximo debe ser un número positivo')
            .custom((maxAmount, { req }) => {
                const minAmount = req.query.minAmount;
                if (minAmount && parseFloat(maxAmount) < parseFloat(minAmount)) {
                    throw new Error('El monto máximo debe ser mayor que el monto mínimo');
                }
                return true;
            })
    ],

    /**
     * Validación para filtros de visitantes en reportes
     */
    visitorFiltersValidation: [
        query('status')
            .optional()
            .isIn(['active', 'completed'])
            .withMessage('Estado de visita inválido'),
        query('minDuration')
            .optional()
            .isInt({ min: 0 })
            .withMessage('La duración mínima debe ser un número positivo'),
        query('maxDuration')
            .optional()
            .isInt({ min: 0 })
            .withMessage('La duración máxima debe ser un número positivo')
            .custom((maxDuration, { req }) => {
                const minDuration = req.query.minDuration;
                if (minDuration && parseInt(maxDuration) < parseInt(minDuration)) {
                    throw new Error('La duración máxima debe ser mayor que la duración mínima');
                }
                return true;
            })
    ]
};

export default reportValidator;