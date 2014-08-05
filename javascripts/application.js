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
            var putRequest = indexedDB.open(databaseName, version);

            putRequest.onsuccess = function() {
                console.log("[DEBUG] Put, on objectStore: ["+ options.objectStoreName +"].");

                var db = putRequest.result;
                var tx = db.transaction(options.objectStoreName, "readwrite");
                var store = tx.objectStore(options.objectStoreName);
                options.success(store);

                tx.oncomplete = function() {
                    db.close();
                };
            };
        };

        return {
            put: function(objectStoreName, data) {
                open({
                    objectStoreName: objectStoreName,
                    success: function(store){
                        store.put(data);
                    }
                })
            }
        }
    }();

    var custumer = function(attrs) {
        var OBJECT_STORE_NAME = "custumers";
        var id    = attrs.id === undefined ? null : attrs.id;
        var name  = attrs.name;
        var phone = attrs.phone;

        return {
            save: function() {
                console.log("Customer data: [");
                console.log(attrs);
                console.log("]");
                database.put(OBJECT_STORE_NAME, attrs);
            }
        }
    };

    var custumer_controller = {
        bindEvents: function(){
            var custumerSaveButton = document.getElementById('create_custumer');
            custumerSaveButton.addEventListener("click", function() {
                custumer({
                    name: document.getElementById('name').value,
                    phone:  document.getElementById('phone').value
                }).save();
            });
        }
    };

    custumer_controller.bindEvents();
}();
