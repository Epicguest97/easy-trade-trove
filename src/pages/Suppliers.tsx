
// Fix for the url property error on line 126
// Change from:
// setSqlQuery(query.url.toString());
// To:
setSqlQuery(query.toSql ? query.toSql() : 'SELECT * FROM suppliers');
