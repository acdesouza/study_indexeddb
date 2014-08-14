var Models = function(){
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

        function open(options){
            var requestOpenDb = indexedDB.open(databaseName, version);

            requestOpenDb.onsuccess = function() {

                var db = requestOpenDb.result;
                var tx = db.transaction(options.objectStoreName, "readwrite");
                var store = tx.objectStore(options.objectStoreName);

                var requestedOperation = options.operation(store);
                if( requestedOperation !== undefined ) {
                    requestedOperation.onsuccess = function(e) {
                        options.success(e.target.result);
                    };
                }

                tx.oncomplete = function(e) {
                    db.close();
                };
            };
        };

        return {
            put: function(objectStoreName, data, callbacks) {
                console.log("[DEBUG] put on objectStore: ["+ objectStoreName +"].");
                open({
                    objectStoreName: objectStoreName,
                    operation: function(store){
                        return store.put(data);
                    },
                    success: function(id) {
                        data.id = id;

                        console.log("[DEBUG] new customer: [");
                        console.log(data);
                        console.log("]");

                        callbacks.success(data);
                    }
                })
            },

            destroy: function(objectStoreName, id, callbacks) {
                console.log("[DEBUG] delete, on objectStore: ["+ objectStoreName +"], id: "+ id +".");
                open({
                    objectStoreName: objectStoreName,
                    operation: function(store) {
                        return store.delete(id);
                    },
                    success: function(id) {
                        callbacks.success();
                    }
                });
            },

            forEachIn: function(objectStoreName, callbacks) {
                console.log("[DEBUG] forEachIn objectStore: ["+ objectStoreName +"].");
                open({
                    objectStoreName: objectStoreName,
                    operation: function(store) {
                        // Get everything in the store;
                        var keyRange = IDBKeyRange.lowerBound(0);
                        var cursorRequest = store.openCursor(keyRange);

                        cursorRequest.onsuccess = function(e) {
                            var result = e.target.result;
                            if(!!result == false)
                                return;

                            var element = result.value;
                            console.log("[DEBUG] forEachIn - value: [");
                            console.log(element);
                            console.log("]");
                            callbacks.success(element);

                            result.continue();
                        };
                    }
                });
            }
        };
    }();

    var custumer = function(attrs) {
        var OBJECT_STORE_NAME = "custumers";

        return {
            save: function(callbacks) {
                if(attrs.id === undefined || attrs.id === null || attrs.id === "") {
                    delete attrs.id;
                } else {
                    attrs.id = parseInt(attrs.id);
                }
                database.put(OBJECT_STORE_NAME, attrs, callbacks);
            },

            destroy: function(callbacks) {
                database.destroy(OBJECT_STORE_NAME, attrs.id, callbacks);
            },

            forEachIn: function(callbacks) {
                database.forEachIn(OBJECT_STORE_NAME, callbacks);
            }
        }
    };

    return {
        custumer: custumer
    }
}();
