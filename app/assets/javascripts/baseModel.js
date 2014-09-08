var BaseModel = function(databaseName, version, migrations) {
    var database = function() {
        var requestCreateDatabase = indexedDB.open(databaseName, version);
        requestCreateDatabase.onupgradeneeded = function(event) {
            var db = requestCreateDatabase.result;

            migrations(db, event);
        };
        requestCreateDatabase.onsuccess = function() {
            var db = requestCreateDatabase.result;
            db.close();
        };

        function open(options) {
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
        }

        return {
            put: function(objectStoreName, data, callbacks) {
                console.debug("[DEBUG]", "Put on objectStore: [", objectStoreName, "].");
                open({
                    objectStoreName: objectStoreName,
                    operation: function(store){
                        return store.put(data);
                    },
                    success: function(id) {
                        data.id = id;

                        console.info("[INFO]", "new customer: [", data, "]");

                        callbacks.success(data);
                    }
                });
            },

            destroy: function(objectStoreName, id, callbacks) {
                console.debug("[DEBUG]", "delete, on objectStore: [", objectStoreName, "], id: ", id, ".");
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
                console.debug("[DEBUG]", "forEachIn objectStore: [", objectStoreName, "].");
                open({
                    objectStoreName: objectStoreName,
                    operation: function(store) {
                        // Get everything in the store;
                        var keyRange = IDBKeyRange.lowerBound(0);
                        var cursorRequest = store.openCursor(keyRange);

                        cursorRequest.onsuccess = function(e) {
                            var result = e.target.result;
                            if(result === null || result === false)
                                return;

                            var element = result.value;
                            console.log("[DEBUG]", " forEachIn - value: [", element, "]");
                            callbacks.success(element);

                            result.continue();
                        };
                    }
                });
            }
        };
    }();

    return {
        add: function(modelName, objectStoreName, model) {
            this[modelName] = function(attrs) {
                var m = null;
                if(model) {
                    m = model(attrs);
                } else {
                    m = function(attrs) {
                        return {};
                    };
                }

                m.save = function(callbacks) {
                    if(attrs.id === undefined || attrs.id === null || attrs.id === "") {
                        delete attrs.id;
                    } else {
                        attrs.id = parseInt(attrs.id);
                    }
                    database.put(objectStoreName, attrs, callbacks);
                };

                m.destroy = function(callbacks) {
                    database.destroy(objectStoreName, attrs.id, callbacks);
                };

                m.forEachIn = function(callbacks) {
                    database.forEachIn(objectStoreName, callbacks);
                };

                return m;
            };
        }
    };
};

