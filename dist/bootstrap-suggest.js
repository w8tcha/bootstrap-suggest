/*!
 * bootstrap-suggest -  v2.1.1 (https://github.com/w8tcha/bootstrap-suggest#readme)
 * Copyright 2013-2025 Jovanni Lo (lodev09@gmail.com)
 * Licensed under MIT (https://github.com/lodev09/@w8tcha/bootstrap-suggest/blob/master/LICENSE)
 */

(function($) {
    "use strict";
    var Suggest = function(el, key, options) {
        var that = this;
        this.$element = $(el);
        this.$items = undefined;
        this.options = $.extend(true, {}, $.fn.suggest.defaults, options, this.$element.data(), this.$element.data("options"));
        this.key = key;
        this.isShown = false;
        this.query = "";
        this._queryPos = [];
        this._keyPos = -1;
        this.$dropdown = $("<div />", {
            class: "dropdown suggest " + this.options.dropdownClass,
            html: $("<div />", {
                class: "dropdown-menu",
                role: "menu"
            }),
            "data-key": this.key
        });
        this.load();
    };
    Suggest.prototype = {
        __setListener: function() {
            this.$element.on("suggest.show", $.proxy(this.options.onshow, this)).on("suggest.select", $.proxy(this.options.onselect, this)).on("suggest.lookup", $.proxy(this.options.onlookup, this)).on("keyup", $.proxy(this.__keyup, this));
            return this;
        },
        __getCaretPos: function(posStart) {
            var properties = [ "direction", "boxSizing", "width", "height", "overflowX", "overflowY", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "fontSizeAdjust", "lineHeight", "fontFamily", "textAlign", "textTransform", "textIndent", "textDecoration", "letterSpacing", "wordSpacing" ];
            var isFirefox = !(window.mozInnerScreenX == null);
            var getCaretCoordinatesFn = function(element, position, recalculate) {
                var div = document.createElement("div");
                div.id = "input-textarea-caret-position-mirror-div";
                document.body.appendChild(div);
                var style = div.style;
                var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;
                style.whiteSpace = "pre-wrap";
                if (element.nodeName !== "INPUT") style.wordWrap = "break-word";
                style.position = "absolute";
                style.visibility = "hidden";
                $.each(properties, function(index, value) {
                    style[value] = computed[value];
                });
                if (isFirefox) {
                    style.width = parseInt(computed.width) - 2 + "px";
                    if (element.scrollHeight > parseInt(computed.height)) style.overflowY = "scroll";
                } else {
                    style.overflow = "hidden";
                }
                div.textContent = element.value.substring(0, position);
                if (element.nodeName === "INPUT") div.textContent = div.textContent.replace(/\s/g, " ");
                var span = document.createElement("span");
                span.textContent = element.value.substring(position) || ".";
                div.appendChild(span);
                var coordinates = {
                    top: span.offsetTop + parseInt(computed["borderTopWidth"]),
                    left: span.offsetLeft + parseInt(computed["borderLeftWidth"])
                };
                document.body.removeChild(div);
                return coordinates;
            };
            return getCaretCoordinatesFn(this.$element.get(0), posStart);
        },
        __keyup: function(e) {
            var specialChars = [ 38, 40, 37, 39, 17, 18, 9, 16, 20, 91, 93, 36, 35, 45, 33, 34, 144, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 145, 19 ];
            switch (e.keyCode) {
              case 27:
                this.hide();
                return;

              case 13:
                return true;
            }
            if ($.inArray(e.keyCode, specialChars) !== -1) return;
            var $el = this.$element, val = $el.val(), currentPos = this.__getSelection($el.get(0)).start;
            for (var i = currentPos; i >= 0; i--) {
                var subChar = $.trim(val.substring(i - 1, i));
                if (!subChar && this.options.respectWhitespace) {
                    this.hide();
                    break;
                }
                var isSpaceBefore = $.trim(val.substring(i - 2, i - 1)) == "";
                if (subChar === this.key && (isSpaceBefore || !this.options.respectWhitespace)) {
                    this.query = val.substring(i, currentPos);
                    this._queryPos = [ i, currentPos ];
                    this._keyPos = i;
                    this.lookup(this.query);
                    break;
                }
            }
        },
        __getVisibleItems: function() {
            return this.$items ? this.$items.not(".d-none") : $();
        },
        __build: function() {
            var elems = [], $item, $dropdown = this.$dropdown, that = this;
            var blur = function(e) {
                that.hide();
            };
            $dropdown.on("click", "a.dropdown-item", function(e) {
                e.preventDefault();
                that.__select($(this).index());
                that.$element.focus();
            }).on("mouseover", "a.dropdown-item", function(e) {
                that.$element.off("blur", blur);
            }).on("mouseout", "a.dropdown-item", function(e) {
                that.$element.on("blur", blur);
            });
            this.$element.before($dropdown).on("blur", blur).on("keydown", function(e) {
                var $visibleItems;
                if (that.isShown) {
                    switch (e.keyCode) {
                      case 13:
                      case 9:
                        $visibleItems = that.__getVisibleItems();
                        $visibleItems.each(function(index) {
                            if ($(this).is(".active")) that.__select($(this).index());
                        });
                        return false;
                        break;

                      case 40:
                        $visibleItems = that.__getVisibleItems();
                        if ($visibleItems.last().is(".active")) return false;
                        $visibleItems.each(function(index) {
                            var $this = $(this), $next = $visibleItems.eq(index + 1);
                            if ($this.is(".active")) {
                                if (!$next.is(".d-none")) {
                                    $this.removeClass("active");
                                    $next.addClass("active");
                                }
                                return false;
                            }
                        });
                        return false;

                      case 38:
                        $visibleItems = that.__getVisibleItems();
                        if ($visibleItems.first().is(".active")) return false;
                        $visibleItems.each(function(index) {
                            var $this = $(this), $prev = $visibleItems.eq(index - 1);
                            if ($this.is(".active")) {
                                if (!$prev.is(".d-none")) {
                                    $this.removeClass("active");
                                    $prev.addClass("active");
                                }
                                return false;
                            }
                        });
                        return false;
                    }
                }
            });
        },
        __mapItem: function(dataItem) {
            var itemHtml, that = this, _item = {
                text: "",
                value: "",
                class: ""
            };
            if (this.options.map) {
                dataItem = this.options.map(dataItem);
                if (!dataItem) return false;
            }
            if (dataItem instanceof Object) {
                _item.text = dataItem.text || "";
                _item.value = dataItem.value || "";
                _item.class = dataItem.class || "";
            } else {
                _item.text = dataItem;
                _item.value = dataItem;
            }
            return $("<a />", {
                class: "dropdown-item" + " " + _item.class,
                "data-value": _item.value,
                href: "#",
                html: _item.text
            });
        },
        __select: function(index) {
            var endKey = this.options.endKey || "";
            var $el = this.$element, el = $el.get(0), val = $el.val(), item = this.get(index), setCaretPos = this._keyPos + item.value.length + 1;
            $el.val(val.slice(0, this._keyPos) + item.value + endKey + " " + val.slice(this.__getSelection(el).start));
            $el.blur();
            if (el.setSelectionRange) {
                el.setSelectionRange(setCaretPos, setCaretPos);
            } else if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd("character", setCaretPos);
                range.moveStart("character", setCaretPos);
                range.select();
            }
            $el.trigger($.extend({
                type: "suggest.select"
            }, this), item);
            this.hide();
        },
        __getSelection: function(el) {
            el.focus();
            return {
                start: el.selectionStart,
                end: el.selectionEnd
            };
        },
        __buildItems: function(data) {
            var $dropdownMenu = this.$dropdown.find(".dropdown-menu");
            $dropdownMenu.empty();
            if (data && data instanceof Array) {
                for (var i in data) {
                    var $item = this.__mapItem(data[i]);
                    if ($item) {
                        $dropdownMenu.append($item);
                    }
                }
            }
            return $dropdownMenu.find("a.dropdown-item");
        },
        __lookup: function(q, $resultItems) {
            var active = $resultItems.eq(0).addClass("active");
            this.$element.trigger($.extend({
                type: "suggest.lookup"
            }, this), [ q, $resultItems ]);
            if ($resultItems && $resultItems.length) {
                this.show();
            } else {
                this.hide();
            }
        },
        __filterData: function(q, data) {
            var options = this.options;
            this.$items.addClass("d-none");
            this.$items.filter(function(index) {
                if (q === "") return index < options.filter.limit;
                var value = $(this).text();
                var selectorValue = $(this).data().value;
                if (!options.filter.casesensitive) {
                    value = value.toLowerCase();
                    q = q.toLowerCase();
                    selectorValue = selectorValue.toLowerCase();
                }
                return value.indexOf(q) != -1 || selectorValue.indexOf(q) != -1;
            }).slice(0, options.filter.limit).removeClass("d-none active");
            return this.__getVisibleItems();
        },
        get: function(index) {
            if (!this.$items) return;
            var $item = this.$items.eq(index);
            return {
                text: $item.text(),
                value: $item.attr("data-value"),
                index: index,
                $element: $item
            };
        },
        lookup: function(q) {
            var options = this.options, that = this, data;
            var provide = function(data) {
                if (that._keyPos !== -1) {
                    if (!that.$items) {
                        that.$items = that.__buildItems(data);
                    }
                    that.__lookup(q, that.__filterData(q, data));
                }
            };
            if (typeof this.options.data === "function") {
                this.$items = undefined;
                data = this.options.data(q, provide);
            } else {
                data = this.options.data;
            }
            if (data && typeof data.promise === "function") {
                data.done(provide);
            } else if (data) {
                provide.call(this, data);
            }
        },
        load: function() {
            this.__setListener();
            this.__build();
        },
        hide: function() {
            this.$dropdown.find(".dropdown-menu").removeClass("show");
            this.isShown = false;
            if (this.$items) {
                this.$items.removeClass("active");
            }
            this._keyPos = -1;
        },
        show: function() {
            var $el = this.$element, $dropdownMenu = this.$dropdown.find(".dropdown-menu"), el = $el.get(0), options = this.options, caretPos, position = {
                top: "auto",
                bottom: "auto",
                left: "auto",
                right: "auto"
            };
            if (!this.isShown) {
                $dropdownMenu.addClass("show");
                if (options.position !== false) {
                    caretPos = this.__getCaretPos(this._keyPos);
                    if (typeof options.position == "string") {
                        switch (options.position) {
                          case "bottom":
                            position.top = $el.outerHeight() - parseFloat($dropdownMenu.css("margin-top"));
                            position.left = 0;
                            position.right = 0;
                            break;

                          case "top":
                            position.top = -($dropdownMenu.outerHeight(true) + parseFloat($dropdownMenu.css("margin-top")));
                            position.left = 0;
                            position.right = 0;
                            break;

                          case "caret":
                            position.top = caretPos.top - el.scrollTop;
                            position.left = caretPos.left - el.scrollLeft;
                            break;
                        }
                    } else {
                        position = $.extend(position, typeof options.position === "function" ? options.position(el, caretPos) : options.position);
                    }
                    $dropdownMenu.css(position);
                }
                this.isShown = true;
                $el.trigger($.extend({
                    type: "suggest.show"
                }, this));
            }
        }
    };
    var old = $.fn.suggest;
    $.fn.suggest = function(arg1) {
        var arg2 = arguments[1], arg3 = arguments[2];
        var createSuggestions = function(el, suggestions) {
            var newData = {};
            $.each(suggestions, function(keyChar, options) {
                var key = keyChar.toString().charAt(0);
                newData[key] = new Suggest(el, key, typeof options === "object" && options);
            });
            return newData;
        };
        return this.each(function() {
            var that = this, $this = $(this), data = $this.data("suggest"), suggestions = {};
            if (typeof arg1 === "string") {
                if (arg1.length == 1) {
                    if (arg2) {
                        if (typeof arg2 === "string") {
                            if (arg1 in data && typeof data[arg1][arg2] !== "undefined") {
                                return data[arg1][arg2].call(data[arg1], arg3);
                            } else {
                                console.error(arg1 + " is not a suggest");
                            }
                        } else {
                            suggestions[arg1] = $.isArray(arg2) || typeof arg2 === "function" ? {
                                data: arg2
                            } : arg2;
                            if (data && arg1 in data) {
                                data[arg1].options = $.extend({}, data[arg1].options, suggestions[arg1]);
                            } else {
                                data = $.extend(data, createSuggestions(this, suggestions));
                            }
                            $this.data("suggest", data);
                        }
                    }
                } else {
                    console.error("you're not initializing suggest properly. arg1 should have length == 1");
                }
            } else {
                if (!data) $this.data("suggest", createSuggestions(this, arg1)); else if (data) {
                    $.each(arg1, function(key, value) {
                        if (key in data === false) {
                            suggestions[key] = value;
                        } else {
                            data[key].options = $.extend({}, data[key].options, value);
                        }
                    });
                    $this.data("suggest", $.extend(data, createSuggestions(that, suggestions)));
                }
            }
        });
    };
    $.fn.suggest.defaults = {
        data: [],
        map: undefined,
        filter: {
            casesensitive: false,
            limit: 5
        },
        dropdownClass: "",
        position: "caret",
        endKey: "",
        respectWhitespace: true,
        onshow: function(e) {},
        onselect: function(e, item) {},
        onlookup: function(e, item) {}
    };
    $.fn.suggest.Constructor = Suggest;
    $.fn.suggest.noConflict = function() {
        $.fn.suggest = old;
        return this;
    };
})(jQuery);