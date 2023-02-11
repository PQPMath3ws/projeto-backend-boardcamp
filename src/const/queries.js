const queries = {
    select: (itemsToSelect, table, whereSelectCondition) => (`SELECT ${itemsToSelect} FROM "${table}"${whereSelectCondition ? " WHERE " + whereSelectCondition : ""};`),
    insert: (table, tableValuesToInsert, values) => (`INSERT INTO "${table}" (${tableValuesToInsert}) VALUES (${values.map(value => Number.isInteger(Number(value)) && typeof value !== 'string' ? value ? value : "null" : new Date(value) instanceof Date && !isNaN(new Date(value)) ? `'${new Date(value).toISOString().split("T")[0]}'` : value `'${value}'`).toString()});`),
    update: (table, tableValuesToUpdate, condition) => (`UPDATE "${table}" SET ${tableValuesToUpdate.toString()} WHERE ${condition};`),
    delete: (table, whereDeleteCondition) => (`DELETE FROM "${table}" WHERE ${whereDeleteCondition};`),
};

export default queries;