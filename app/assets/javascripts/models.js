var Models = BaseModel("IndexedDbApp", 1);

Models.add('custumer', function(attrs) {
    var OBJECT_STORE_NAME = "custumers";

    return {
        getObjectStoreName: function() {
            return OBJECT_STORE_NAME;
        },

        migration: function(event) {
            if (event.oldVersion < 1) {
                console.log("[DEBUG] Creates custumers object store.");
                var custumers = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id", autoIncrement: true});
            }
        }
    }
});
