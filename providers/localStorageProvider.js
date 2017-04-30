localStorageProvider = function(){
    var boxes = {};

    function send(msg) {
        var to = msg.to.toLowerCase();
        var from = msg.from.toLowerCase();
        storeMail(to, msg)
        if (to != from) {
            storeMail(from, msg)
        };

        this.receive(msg);
        return true;
    };

    function reload(name) {
        for (var x in messages(name)) {
            this.receive(messages(name)[x]);
        };
    };

    function messages(box) {
        var arr = [];
        if (localStorage.getItem(box)) {
            arr = JSON.parse(localStorage.getItem(box));
            for (var x in arr) {
                arr[x].date = new Date(arr[x].date);
            };
        };
        return arr;
    };

    function storeMail(box, msg) {
        var arr = messages(box);
        arr.push(msg);
        localStorage.setItem(box, JSON.stringify(arr));
    };

    return {
        send: send,
        reload: reload
    };
}();
