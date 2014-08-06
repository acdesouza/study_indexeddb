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

    var custumer_controller = function() {
        var showPersistedCustumers = function(custumerObj) {
            if(custumerObj !== undefined) {
                var existingCustumersRow = document.getElementById("custumer_"+ custumerObj.id);
                if(existingCustumersRow !== null){
                    existingCustumersRow.remove();
                }

                var custumersTableBody = document.getElementById('custumers').tBodies[0];
                var newCustumerRow = custumersTableBody.insertRow();
                newCustumerRow.id  = "custumer_"+ custumerObj.id;

                var cellsCount = 0;

                var custumerName = newCustumerRow.insertCell(cellsCount++);
                custumerName.innerHTML = custumerObj.name;

                var custumerPhone = newCustumerRow.insertCell(cellsCount++);
                custumerPhone.innerHTML = custumerObj.phone;

                var custumerEdit = newCustumerRow.insertCell(cellsCount++);
                var editButton = document.createElement("BUTTON");
                editButton.innerHTML = "Edit";
                editButton.addEventListener("click", function() {
                    document.getElementById('id').value = custumerObj.id;
                    document.getElementById('name').value = custumerObj.name;
                    document.getElementById('phone').value = custumerObj.phone;
                });
                custumerEdit.appendChild(editButton);

                var custumerDelete = newCustumerRow.insertCell(cellsCount++);
                var deleteButton = document.createElement("BUTTON");
                deleteButton.innerHTML = "X";
                deleteButton.addEventListener("click", function() {
                    custumer({
                        id: custumerObj.id
                    }).destroy({
                        success: function() {
                            custumersTableBody.deleteRow(newCustumerRow.rowIndex-1);
                        }
                    });
                });
                custumerDelete.appendChild(deleteButton);
            }
        };

        var bindEvents = function (){
            var custumerSaveButton = document.getElementById('create_custumer');
            custumerSaveButton.addEventListener("click", function() {
                custumer({
                    id: document.getElementById('id').value,
                    name: document.getElementById('name').value,
                    phone:  document.getElementById('phone').value
                }).save({
                    success: function(custumer) {
                        showPersistedCustumers(custumer);
                        document.getElementById('id').value = "";
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
