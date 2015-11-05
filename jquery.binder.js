(function ($) {
    'use strict';
    var callbackCache = [];
    $.fn.binder = function (identity, event_name, handler) {
        var thatSelector = this.selector;
        return this.each(function (e) {
            if ($.isFunction(event_name)) { // if $('thing').binder('click', callback);
                handler = event_name;
                event_name = identity;
                identity = true;
            }
            if ($.isFunction(identity)) { // if $('thing').binder(callback);
                handler = identity;
                identity = true;
            }

            var id = callbackCache.indexOf(handler);
            if (id === -1) {
                id = callbackCache.push(handler);
            }
            if (identity === true) {
                identity = thatSelector + id;
            }

            if (!$.binder.keyedCallbacks[identity]) {
                identity = 'binder' + identity; // if $('thing').binder('identity', 'event', callback)
                $.binder.keyedCallbacks[identity] = [thatSelector, identity, event_name, handler];
            }
            if (!$(this).data(identity)) {
                if (typeof event_name === 'function') { // if $('thing').binder('identity', callback)
                    $.proxy(event_name, $(this).data(identity, true))(e);
                } else {
                    $(this).bind(event_name, handler).data(identity, true);
                }
            }
        });
    };

    $.binder = function (identity, event_name, handler) {
        return $('[data-binder="' + identity + '"]').each(function () {
            $(this).binder(identity, event_name, handler);
        });
    };
    $.binder.keyedCallbacks = {};
    $.binder.callbacks = [];
    $.binder.run = function () {
        $.each($.binder.callbacks, function (i, cb) {
            cb();
        });
        $.each($.binder.keyedCallbacks, function (k, v) {
            var args = v.concat();
            args.shift();
            $(v[0]).binder.apply($(v[0]), args);
        });
    };
    $.binder.add = function (cb) {
        return $.binder.callbacks.push(cb);
    };
    $.binder.ajaxing = false;
    $.binder.ajaxApplied = false;
    $.binder.ajax = function (status) {
        $.binder.ajaxing = status;
        if ($.binder.ajaxApplied) {
            return;
        }
        $.binder.ajaxApplied = true;
        $(document).ajaxComplete(function (event, jqXHR, ajaxOptions) {
            if (!$.binder.ajaxing) {
                return;
            }
            if (!ajaxOptions.skipBinder) {
                $($.binder.run);
            }
        }); // fire biner after ajax callback is completed
    };

}(jQuery));