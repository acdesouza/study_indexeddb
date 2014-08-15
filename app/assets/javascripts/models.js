Models.add('custumer', function(attrs) {
    var OBJECT_STORE_NAME = "custumers";

    return {
        getObjectStoreName: function() {
            return OBJECT_STORE_NAME;
        }
    }
});
