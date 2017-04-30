function userInterface(){
    var dom = {};

    var panes = {};

    function setup() {
        panes = {
            'compose': document.getElementById("compose"),
            'list': document.getElementById("list"),
            'msg-view': document.getElementById("msg-view"),
            'preferences': document.getElementById("preferences")
        };
        dom = {
            'more': document.getElementById("more"),
            'list-replacement': document.getElementById("list-replacement"),
            'msgtable': document.getElementById("msgtable"),
            'username': document.getElementById("username"),
            'from': document.getElementById("from"),
            'to': document.getElementById("to"),
            'subject': document.getElementById("subject"),
            'body': document.getElementById("body"),
            'msglist': document.getElementById("msglist"),
            'view-from': document.getElementById("view-from"),
            'view-to': document.getElementById("view-to"),
            'view-subject': document.getElementById("view-subject"),
            'view-date': document.getElementById("view-date"),
            'view-body': document.getElementById("view-body"),
            'view-encrypted': document.getElementById("view-encrypted"),
            'encrypted': document.getElementById("encrypted"),
            'encrypted-row': document.getElementById("encrypted-row"),
            'showmore': document.getElementById("showmore"),
            'reply': document.getElementById("reply"),
            'yes': document.getElementById("preferyes"),
            'no': document.getElementById("preferno"),
            'enable': document.getElementById("enable"),
            'description': document.getElementById("description"),
            'explanation': document.getElementById("explanation"),
            'settings': document.getElementById("autocrypt-settings")
        };
        dom['encrypted'].parentNode.insertBefore(img('lock'), dom['encrypted']);
    };

    function pane(choice) {
        for (var x in panes) {
            panes[x].style.display = 'none';
            e = document.getElementById("tab-" + x);
            if (e) {
                e.classList.remove('selected');
            }
        }
        panes[choice].style.display = 'block';
        n = "tab-" + choice;
        e = document.getElementById(n);
        if (e) {
            e.classList.add('selected');
        }
        if (choice == 'compose') {
            dom['to'].focus();
            updatecompose();
        } else if (choice == 'list') {
            populate_list();
            clearcompose();
        }
    };

    function clearcompose() {
        dom['to'].value = '';
        dom['body'].value = '';
        dom['subject'].value = '';
        dom['encrypted'].checked = false;
    };

    function show_msg(msg) {
        dom['view-from'].innerText = msg['from'];
        dom['view-to'].innerText = msg['to'];
        dom['view-subject'].innerText = msg['subject'];
        dom['view-date'].innerText = msg['date'];
        dom['view-encrypted'].replaceChild(get_encryption_status_node(msg['encrypted']), dom['view-encrypted'].childNodes[0]);
        dom['view-body'].innerText = msg['body'];

        if (msg['from'] == user) {
            dom['reply'].style.display = 'none';
        } else {
            dom['reply'].style.display = 'inline';
            dom['reply'].onclick = function() { reply_to_msg(msg); };
        }

        pane('msg-view');
    };

    function reply_to_msg(msg) {
        dom['to'].value = msg['from'];
        dom['subject'].value = 'Re: ' + msg['subject'];
        dom['body'].value = indent(msg['body']);
        replying_to = msg;
        pane('compose');
        dom['encrypted'].checked = dom['encrypted'].checked || msg['encrypted'];
    };

    function populate_list() {

        while (dom['msglist'].hasChildNodes())
            dom['msglist'].removeChild(dom['msglist'].lastChild);

        if (messages.length) {
            for (var x in messages) {
                dom['msglist'].appendChild(generate_list_entry_from_msg(messages[x]));
            }
            dom['list-replacement'].style.display = 'none';
            dom['msgtable'].style.display = 'table';
        } else {
            dom['list-replacement'].style.display = 'block';
            dom['msgtable'].style.display = 'none';
        }
    };

    function sendmail() {
        if (addmail(dom['to'].value, dom['subject'].value, dom['body'].value, dom['encrypted'].checked)) {
            clearcompose();
            pane('list');
            return false;
        } else {
            return false;
        }
    };

    function updatecompose() {
        var to = dom['to'].value;
        var ac = getacforpeer(to);

        if (!autocrypt['enabled']) {
            if (ac['prefer-encrypted']) {
                dom['encrypted-row'].style.display = 'table-row';
                dom['encrypted'].checked = false;
                enablecheckbox(dom['encrypted'], true);
                dom['explanation'].innerText = 'enable Autocrypt to encrypt';
            } else {
                dom['encrypted-row'].style.display = 'none';
            }
        } else {
            dom['encrypted-row'].style.display = 'table-row';
            if (ac['key'] !== undefined) {
                dom['encrypted'].checked = ac['prefer-encrypted'];
                enablecheckbox(dom['encrypted'], true);
                dom['explanation'].innerText = '';
            } else {
                dom['encrypted'].checked = false;
                enablecheckbox(dom['encrypted'], false);
                if (to == '')
                    dom['explanation'].innerText = 'please choose a recipient';
                else
                    dom['explanation'].innerText = 'If you want to encrypt to ' + to + ', ask ' + to + ' to enable Autocrypt and send you an e-mail';
            }
        }
    };

    function clickencrypted() {
        var to = dom['to'].value;
        var ac = getacforpeer(to);
        var encrypted = dom['encrypted'].checked;

        // FIXME: if autocrypt is disabled and we've set encrypt, prompt the user about it.
        if (encrypted && autocrypt['enabled'] === false) {
            if (confirm("Please only enable Autocrypt on one device.\n\n" +
                        "Are you sure you want to enable Autocrypt on this device?")) {
                autocrypt_switch(user, true);
                setupprefs();
                update_description();
            } else {
                dom['encrypted'].checked = false;
                encrypted = false;
            }
        }
        if (!autocrypt['enabled'] && !dom['encrypted'].disabled) {
            dom['explanation'].innerText = 'enable Autocrypt to encrypt';
        } else if (encrypted && ac['prefer-encrypted'] === false) {
            dom['explanation'].innerText = to + ' prefers to receive unencrypted mail.  It might be hard for them to read.';
        } else if (!encrypted && ac['prefer-encrypted'] === true) {
            dom['explanation'].innerText = to + ' prefers to receive encrypted mail!';
        }  else {
            dom['explanation'].innerText = '';
        }
    };

    function more() {
        dom['showmore'].checked = !dom['showmore'].checked;
        update_description();
        return false;
    };


    function get_description() {
        if (!dom['enable'].checked) {
            return 'Autocrypt is disabled on this device.';
        }
        if (dom['yes'].checked) {
            return 'Autocrypt will encourage your peers to send you encrypted mail.';
        }
        if (dom['no'].checked) {
            return 'Autocrypt will discourage your peers from sending you encrypted mail.';
        }
        return 'Autocrypt lets your peers choose whether to send you encrypted mail.';
    };

    function autocrypt_preference(p) {
        if (p == 'yes') {
            other = 'no';
        } else {
            other = 'yes';
            p = 'no';
        };
        dom[other].checked = false;
        if (dom['yes'].checked) {
            autocrypt['prefer-encrypted'] = true;
        } else if (dom['no'].checked) {
            autocrypt['prefer-encrypted'] = false;
        } else {
            delete autocrypt['prefer-encrypted'];
        }
        self_sync_autocrypt_state();
        update_description();
    };

    function autocrypt_enable() {
        autocrypt_switch(dom['enable'].checked);
        update_description();
    };

    function enablecheckbox(box, enabled) {
        box.disabled = !enabled;
        if (enabled)
            box.parentElement.classList.remove('disabled');
        else
            box.parentElement.classList.add('disabled');
    };

    function update_description() {
        disabled = !dom['enable'].checked;
        dom['yes'].disabled = disabled;
        dom['no'].disabled = disabled;
        if (dom['showmore'].checked) {
            dom['settings'].style.display = 'block';
            dom['showmore'].innerText = 'Hide Advanced Settings';
        } else {
            dom['settings'].style.display = 'none';
            dom['showmore'].innerText = 'Advanced Settings...';
        }
        if (disabled) {
            dom['yes'].parentElement.classList.add('disabled');
            dom['no'].parentElement.classList.add('disabled');
            dom['more'].style.display = 'none';
        } else {
            dom['yes'].parentElement.classList.remove('disabled');
            dom['no'].parentElement.classList.remove('disabled');
            dom['more'].style.display = 'block';
        };
        dom['description'].innerText = get_description();
    };

    function switchuser(name) {
        dom['username'].innerText = storage[name]['name'];
        dom['username'].style.color = storage[name]['color'];
        dom['from'].innerText = storage[name]['name'];
        setupprefs();
        dom['showmore'].checked = false;
        pane('list');
        update_description();
    };

    function setupprefs() {
        dom['enable'].checked = autocrypt['enabled'];
        if (autocrypt['prefer-encrypted'] == undefined) {
            dom['yes'].checked = false;
            dom['no'].checked = false;
        } else if (autocrypt['prefer-encrypted'] == true) {
            dom['yes'].checked = true;
            dom['no'].checked = false;
        } else if (autocrypt['prefer-encrypted'] == false) {
            dom['yes'].checked = false;
            dom['no'].checked = true;
        }
    };

    function get_encryption_status_node(encrypted) {
        var x = document.createElement('span');
        if (encrypted) {
            var sub = document.createElement('span');
            x.appendChild(img('lock'));
            sub.innerText = "Message was encrypted";
            x.appendChild(sub);
        } else {
            x.innerText = "Message was not encrypted";
        }

        return x;
    };

    function generate_list_entry_from_msg(msg) {
        var ret = document.createElement('tr');
        ret.classList.add("message");
        ret.onclick = function() { show_msg(msg); };

        var e = document.createElement('td');
        if (msg['encrypted'])
            e.appendChild(img('lock'));
        if (msg['to'].toLowerCase() == user)
            e.appendChild(img('back'));
        if (msg['from'].toLowerCase() == user)
            e.appendChild(img('forward'));
        ret.appendChild(e);

        var f = document.createElement('td');
        f.innerText = msg['from'];
        ret.appendChild(f);

        var t = document.createElement('td');
        t.innerText = msg['to'];
        ret.appendChild(t);

        var s = document.createElement('td');
        s.innerText = msg['subject'];
        ret.appendChild(s);

        var d = document.createElement('td');
        d.innerText = msg['date'];
        ret.appendChild(d);

        return ret;
    };
    function img(what) {
        var index = {
            'lock': 'file:///usr/share/icons/Tango/16x16/emblems/emblem-readonly.png',
            'back': 'file:///usr/share/icons/Tango/16x16/actions/back.png',
            'forward': 'file:///usr/share/icons/Tango/16x16/actions/forward.png'
      };
        var lock = document.createElement('img');
        lock.src = index[what];
        return lock;
    };

    return {
        setup: setup,
        pane: pane,
        update_description: update_description,
        switchuser: switchuser,
        updatecompose: updatecompose,
        autocrypt_enable: autocrypt_enable,
        autocrypt_preference: autocrypt_preference,
        clickencrypted: clickencrypted,
        more: more,
        sendmail: sendmail
    }
};
