routerAdd("GET", "/api/collections", (c) => {

    // Get all collections
    const collections = $app.dao().findCollectionsByType("base").map((collection) => {
        return {
            id: collection.id,
            name: collection.name
        }
    })

    return c.json(200, collections)
})

routerAdd("GET", "/api/collections/:name", (c) => {

    // Get collection by name  
    const name = c.pathParam("name")
    const collection = $app.dao().findCollectionByNameOrId(name)

    let keys = {}

    // Get all keys
    const schemas = JSON.parse(JSON.stringify(collection.schema))
    schemas.forEach((record) => {
        keys[record.name] = record.type === "number" ? 0 : ""
    })

    // Build dynamic model
    const records = arrayOf(new DynamicModel(keys))

    $app.dao().db()
    .select("*")
    .from(name)
    .all(records)

    return c.json(200, records)
})