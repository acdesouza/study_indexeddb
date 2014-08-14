QUnit.asyncTest( "should create Custumer", function( assert ) {
    expect( 1 );

    var expectedCustumer = {
        id: 1,
        name: 'Antonio Carlos de Souza',
        phone:  '9.9876-5432'
    };
    Models.custumer(expectedCustumer).save({
        success: function(savedCustumer) {
            assert.deepEqual(savedCustumer, expectedCustumer);
            QUnit.start();
        }
    });
});
