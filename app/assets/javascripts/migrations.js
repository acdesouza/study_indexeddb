var migrations = function (db, event) {
    if (event.oldVersion < 1) {
        console.log("[DEBUG] Creates custumers object store.");
        var custumers = db.createObjectStore("custumers", {keyPath: "id", autoIncrement: true});
    }
};