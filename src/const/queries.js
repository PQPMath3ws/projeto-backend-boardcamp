const queries = {
    select: (itemsToSelect, table, whereSelectCondition) => (`SELECT ${itemsToSelect} FROM "${table}"${whereSelectCondition ? " WHERE " + whereSelectCondition : ""};`),
};

export default queries;