var IndexedDbApp = function() {
    var database = function() {
        var databaseName = "IndexedDbApp";
        var version = 1;
        var db = null;

        var requestCreateDatabase = indexedDB.open(databaseName, version);
        requestCreateDatabase.onupgradeneeded = function(event) {
            var db = requestCreateDatabase.result;
            if (event.oldVersion < 1) {
                console.log("[DEBUG] Creates custumers object store.");
                var custumers = db.createObjectStore("custumers", {keyPath: "id", autoIncrement: true});
            }
        };
        requestCreateDatabase.onsuccess = function() {
            var db = requestCreateDatabase.result;
            db.close();
        };
    }();
}();
