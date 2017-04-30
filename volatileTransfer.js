volatileTransfer = function(){
    var boxes = {};

    function send(msg) {
        var outbox = messages(msg.from)
        var inbox = messages(msg.to)
        inbox.push(msg);
        if (msg.to.toLowerCase() != msg.from.toLowerCase()) {
            outbox.push(msg);
        };

        this.receive(msg);
        return true;
    };

    function reload(name) {
        for (var x in messages(name)) {
            this.receive(messages(name)[x]);
        };
    };

    function messages(name) {
        if (boxes[name.toLowerCase()] == undefined) {
            boxes[name.toLowerCase()] = []
        };
        return boxes[name.toLowerCase()]
    }

    return {
        send: send,
        reload: reload
    };
}();
