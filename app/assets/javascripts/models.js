var Models = BaseModel("IndexedDbApp", 1);

Models.add('custumer', function(attrs) {
    var OBJECT_STORE_NAME = "custumers";

    return {
        migration: function(event) {
            if (event.oldVersion < 1) {
                console.log("[DEBUG] Creates custumers object store.");
                var custumers = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id", autoIncrement: true});
            }
        },

        save: function(callbacks) {
            if(attrs.id === undefined || attrs.id === null || attrs.id === "") {
                delete attrs.id;
            } else {
                attrs.id = parseInt(attrs.id);
            }
            this.database.put(OBJECT_STORE_NAME, attrs, callbacks);
        },

        destroy: function(callbacks) {
            this.database.destroy(OBJECT_STORE_NAME, attrs.id, callbacks);
        },

        forEachIn: function(callbacks) {
            this.database.forEachIn(OBJECT_STORE_NAME, callbacks);
        }
    }
});
