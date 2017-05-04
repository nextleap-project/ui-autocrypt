(function(){
    var describe = Tests.describe;

    function enableAutocrypt() {
        ui.pane('preferences');
        document.getElementById("enable").click();
    };

    function composeTo(recipient) {
        ui.pane('compose');
        document.getElementById("to").value = recipient;
        document.getElementById("to").onchange();
        document.getElementById("subject").value = 'subject';
        document.getElementById("body").value = 'body';
    };

    function checkEncrypt() {
        document.getElementById("encrypted").click();
    };

    function send() {
        document.getElementById("send").click();
    };

    describe('Smoke test', function(it, assert) {
        function assertHasEncryptedEmail() {
            ui.pane('list');
            assert.selector('#msgtable img[src*="readonly"]');
        };

        this.setup = function() {
            localStorage.clear();
            resetClient();
            switchuser('alice');
        };

        it('autocrypts when enabled', function() {
            switchuser('alice');
            enableAutocrypt();
            composeTo('Bob');
            send();
            switchuser('bob');
            enableAutocrypt();
            composeTo('Alice');
            window.setTimeout(function() {
                checkEncrypt();
                send();
                assertHasEncryptedEmail();
            }, 10)
        });
    })
})();
