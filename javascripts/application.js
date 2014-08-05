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

        function open(options){
            var request = indexedDB.open(databaseName, version);

            request.onsuccess = function() {

                var db = request.result;
                var tx = db.transaction(options.objectStoreName, "readwrite");
                var store = tx.objectStore(options.objectStoreName);
                options.success(store);

                tx.oncomplete = function() {
                    db.close();
                };
            };
        };

        return {
            put: function(objectStoreName, data, callbacks) {
                console.log("[DEBUG] put on objectStore: ["+ objectStoreName +"].");
                open({
                    objectStoreName: objectStoreName,
                    success: function(store){
                        store.put(data);
                        callbacks.success(data);
                    }
                })
            },

            forEachIn: function(objectStoreName, callbacks) {
                console.log("[DEBUG] forEachIn objectStore: ["+ objectStoreName +"].");
                open({
                    objectStoreName: objectStoreName,
                    success: function(store) {
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
        var id    = attrs.id === undefined ? null : attrs.id;
        var name  = attrs.name;
        var phone = attrs.phone;

        return {
            save: function(callbacks) {
                console.log("Customer data: [");
                console.log(attrs);
                console.log("]");
                database.put(OBJECT_STORE_NAME, attrs, callbacks);
            },

            forEachIn: function(callbacks) {
                database.forEachIn(OBJECT_STORE_NAME, callbacks);
            }
        }
    };

    var custumer_controller = function() {
        var showPersistedCustumers = function(custumer) {
            if(custumer !== undefined) {
                var custumersTableBody = document.getElementById('custumers').tBodies[0];
                var newCustumerRow = custumersTableBody.insertRow();
                var custumerName = newCustumerRow.insertCell(0);
                var custumerPhone = newCustumerRow.insertCell(1);
                custumerName.innerHTML = custumer.name;
                custumerPhone.innerHTML = custumer.phone;
            }
        };

        var bindEvents = function (){
            var custumerSaveButton = document.getElementById('create_custumer');
            custumerSaveButton.addEventListener("click", function() {
                custumer({
                    name: document.getElementById('name').value,
                    phone:  document.getElementById('phone').value
                }).save({
                    success: function(custumer) {
                        showPersistedCustumers(custumer);
                        document.getElementById('name').value = "";
                        document.getElementById('phone').value = "";
                    }
                });

            });

            showPersistedCustumers();
        };

        return {
            open: function() {
                custumer({}).forEachIn({
                    success: function(element) {
                        showPersistedCustumers(element);
                    }
                });

                bindEvents();
            },

        };
    };

    custumer_controller().open();
}();
