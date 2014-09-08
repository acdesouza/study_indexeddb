var migrations = function (db, transaction, event) {
    if (event.oldVersion < 1) {
        console.log("[DEBUG] Creates custumers object store.");
        var custumers = db.createObjectStore("custumers", {keyPath: "id", autoIncrement: true});
    }

    if (event.oldVersion < 2) {
        console.log("[DEBUG] Creates custumers name index.");
        var custumerStore = transaction.objectStore("custumers");
        custumerStore.createIndex('byName', 'name', { unique: false });
    }
};
