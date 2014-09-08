var IndexedDbApp = function() {

    var custumer = Models.custumer;

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

            var custumerSearchButton = document.getElementById('search_custumer');
            custumerSearchButton.addEventListener("click", function() {
                custumer().find('byName',
                    document.getElementById('by_name').value,
                    {
                        success: function(custumer) {
                            var custumerTRs = document.getElementById('custumers').tBodies[0].getElementsByTagName('tr');
                            for(var i=0; i < custumerTRs.length; i++){
                                custumerTRs[i].style.backgroundColor = 'white';
                            }

                            if(custumer) {
                                var searchedCustumerTR = custumerTRs["custumer_"+ custumer.id];
                                searchedCustumerTR.style.backgroundColor = 'yellow';
                                window.setInterval(function(){
                                    searchedCustumerTR.style.backgroundColor = 'white';
                                }, 2000);
                            }
                        },
                        error: function(custumer) {
                            var custumerTRs = document.getElementById('custumers').tBodies[0].getElementsByTagName('tr');
                            var searchedCustumerTR = custumerTRs["custumer_"+ custumer.id];
                            for(var i=0; i < custumerTRs.length; i++){
                                custumerTRs[i].style.backgroundColor = 'white';
                            }
                        }
                });
            });
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
