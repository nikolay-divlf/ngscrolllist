/**! ngscrolllist - v1.0.0
* https://divleaf.ru
* Copyright (c) 2024-2025 Goryachev Nikolay; */
(function($){
    jQuery.fn.ngscrolllist = function(options) {
        options = options == undefined ? {} : options;
        return $(this).map(function() {
            var base_options = $.extend(true, {
                self: this,
                events: {
                    initPlugin: function(options) {},
                    setOptionsBefore: function(options) {},
                    setOptionsAfter: function(options) {},
                    getOptions: function() {},
                    clickScrollLeftBefore: function(elem, elem_parent) {},
                    clickScrollLeftAfter: function(elem, elem_parent) {},
                    clickScrollRightBefore: function(elem, elem_parent) {},
                    clickScrollRightAfter: function(elem, elem_parent) {},
                    mousedown: function(event, elem) {},
                    mousemove: function(event, elem) {},
                    mouseup: function (event, elem) {},
                    resize: function() {},
                    update: function(name_update, options) {},
                    scrollUpdateButtons: function(elem_btn_prev, elem_btn_next) {},
                    scrollIndexElem: function(action, elem_parent, scroll_left, base_options) {},
                    animateLeft: function(elem_parent, scroll_left, animate_properties, options_animate) {
                        elem_parent.stop(true).animate(animate_properties, options_animate.duration_easing, function() {
                            scrollUpdateButtons();
                            base_options.events.update('animate_left', base_options.getOptions());
                        }).css('-moz-user-select', 'none');
                    },
                    animateRight: function(elem_parent, scroll_left, animate_properties, options_animate) {
                        elem_parent.stop(true).animate(animate_properties, options_animate.duration_easing, function() {
                            scrollUpdateButtons();
                            base_options.events.update('animate_right', base_options.getOptions());
                        }).css('-moz-user-select', 'none');
                    },
                },
                animate: {
                    properties: {},
                    duration_easing: 250,
                },
                resize: {
                    active: true,
                    active_update_left: true,
                    update_left: 0,
                },
                check_init: true, // check initialization to re-run the plugin for the element
                items_move: 1,
                start_index: 0,
                start_index_auto: false,
                start_index_time: 250,
                start_index_width_left: 0,
                display_nav_btn: true,
                active_nav_btn: true,
                active_dragdrop: true,
                nav_btn: {
                    prev: {
                        items_move: 0,
                        content: '&lt;-prev',
                        elem: undefined,
                    },
                    next: {
                        items_move: 0,
                        content: 'next-&gt;',
                        elem: undefined,
                    },
                },
                lining_style_key: '/*******add_plugin_ngscrolllist*******/',
                lining: {
                    'active_start_elem': {
                        'class': 'ngscrolllist_active-elem',
                        'styles': {},
                    },
                    'block': {
                        'class': 'ngscrolllist',
                        'styles': {
                            '': {'display': 'flex', 'white-space': 'nowrap', 'margin-left': '0', 'padding-left': '0'},
                        },
                    },
                    'block_loader': {
                        'class': 'ngscrolllist--loader',
                        'styles': {},
                    },
                    'name_selector_btn_prev' : 'button',
                    'btn_prev': {
                        'class': 'ngscrolllist_prev-nav-btn',
                        'styles': {'.disabled': {'display': 'none'}},
                    },
                    'js_class_btn_prev': 'js-ngscrolllist_prev-nav-btn',
                    'attrs_btn_prev' : {},
                    'name_selector_btn_next' : 'button',
                    'btn_next': {
                        'class': 'ngscrolllist_next-nav-btn',
                        'styles': {'.disabled': {'display': 'none'}},
                    },
                    'js_class_btn_next': 'js-ngscrolllist_next-nav-btn',
                    'attrs_btn_next' : {},
                    'name_selector_parent_block' : 'div',
                    'attrs_parent_block' : {},
                    'parent_block' : {
                        'class': 'ngscrolllist_parent-block',
                        'styles': {
                            '': {
                                'display': 'flex',
                                'overflow': 'hidden',
                                'overflow-x': 'auto',
                                'scrollbar-width': 'none',
                                'ms-scrollbar-width': 'none',
                                '-ms-overflow-style': 'none',
                                'overflow': '-moz-scrollbars-none',
                            },
                            '::-webkit-scrollbar': {'width': '0', 'height': '0'},
                        },
                    },
                    'parent_block_loader' : {
                        'class': 'ngscrolllist_parent-block--loader',
                        'styles': {},
                    },
                    'js_class_parent_block' : 'js-ngscrolllist_parent-block',
                },
                getStyles: function(options) {
                    function getStyleElem(elem) {
                        var content = '';
                        for (var selector in elem.styles) {
                            content += '.' + elem.class + selector + '{';
                            for (var option in elem.styles[selector]) {
                                content += option + ':' + elem.styles[selector][option] + ';';
                            }
                            content += '}';
                        }
                        return content;
                    }
                    var content = getStyleElem(options.lining.active_start_elem);
                    content += getStyleElem(options.lining.block);
                    content += getStyleElem(options.lining.block_loader);
                    content += getStyleElem(options.lining.btn_prev);
                    content += getStyleElem(options.lining.btn_next);
                    content += getStyleElem(options.lining.parent_block);
                    content += getStyleElem(options.lining.parent_block_loader);
                    return content;
                },
                setOptions: function(options) {
                    this.events.setOptionsBefore(this.getOptions());
                    for (var key_option in options) {
                        for (var key_base_option in this) {
                            if (key_option == key_base_option && typeof this[key_option] == 'function') {
                                delete options[key_option];
                            }
                        }
                    }
                    this.events.setOptionsAfter(options);
                    $.extend(true, this, options, true);
                },
                getOptions: function() {
                    this.events.getOptions();
                    var return_options = {};
                    for (var key_option in this) {
                        if (key_option != 'setOptions' && key_option != 'getOptions') {
                            return_options[key_option] = base_options[key_option];
                        }
                    }
                    return return_options;
                }
            }, options, true);

            function elemWrap() {
                if (!$(base_options.self).is('.' + base_options.lining.block.class)) {
                    $(base_options.self).data('ngscrolllist_add_class_block', true);
                    $(base_options.self).addClass(base_options.lining.block.class);
                }
                if (!$(base_options.self).parent().is('.' + base_options.lining.js_class_parent_block)) {
                    $(base_options.self).data('ngscrolllist_add_wrap', true);
                    $(base_options.self).wrap(
                        strCollectElement(
                            base_options.lining.name_selector_parent_block,
                            base_options.lining.attrs_parent_block,
                            (base_options.lining.parent_block.class + ' ' + base_options.lining.js_class_parent_block).trim()
                        )
                    );
                } else {
                    if (!$(base_options.self).parent().is('.' + base_options.lining.parent_block.class)) {
                        $(base_options.self).parent().addClass(base_options.lining.parent_block.class);
                        $(base_options.self).data('ngscrolllist_add_class_parent_block', true);
                    }
                }
                if (base_options.active_nav_btn && base_options.display_nav_btn) {
                    base_options.nav_btn.prev.elem = $(strCollectElement(
                        base_options.lining.name_selector_btn_prev,
                        base_options.lining.attrs_btn_prev,
                        (base_options.lining.btn_prev.class + ' ' + base_options.lining.js_class_btn_prev).trim(),
                        base_options.nav_btn.prev.content
                    ));
                    base_options.nav_btn.next.elem = $(strCollectElement(
                        base_options.lining.name_selector_btn_next,
                        base_options.lining.attrs_btn_next,
                        (base_options.lining.btn_next.class + ' ' + base_options.lining.js_class_btn_next).trim(),
                        base_options.nav_btn.next.content
                    ));
                    $(base_options.self).parent().after(base_options.nav_btn.next.elem).after(base_options.nav_btn.prev.elem);
                }
            }

            function strCollectElement(name_elem, attrs, name_class, content) {
                var str_attrs = '';
                content = content == undefined ? '' : content;
                $.each(attrs, function(key, value) {
                    str_attrs += ' ' + key + '=' + '\'' + (key == 'class' ? name_class + ' ' + value : value) + '\'';
                });
                if (!attrs.hasOwnProperty('class')) {
                    str_attrs += ' class=' + '\'' + name_class + '\'';
                }
                if (name_elem == 'input') {
                    if (!attrs.hasOwnProperty('value')) {
                        str_attrs += ' value=' + '\'' + content + '\'';
                    }
                    return '<' + name_elem + str_attrs + '/>';
                }
                return '<' + name_elem + str_attrs + '>' + content + '</' + name_elem + '>';
            }

            function addStyles() {
                var content = base_options.getStyles(base_options);
                var is_commit = false;
                var is_tag_style = false;
                $('html head style').each(function() {
                    is_tag_style = true;
                    is_commit = $(this).html().indexOf(base_options.lining_style_key) > 0 ? true : is_commit;
                });
                if (!is_commit && is_tag_style) {
                    var elem_style = $('html head style')[0];
                    $(elem_style).html($(elem_style).html() + '\n' + base_options.lining_style_key + content)
                } else if (!is_commit && !is_tag_style) {
                    $('head').append('<style>' + base_options.lining_style_key + content + '</style>');
                }
            }

            function initScroll() {
                addStyles();
                clickScrollLeft();
                clickScrollRight();
                scrollUpdateButtons();
                base_options.events.update('init_scroll', base_options.getOptions());
                var elem_parent = $(base_options.self).parent();
                if (base_options.active_dragdrop) {
                    var is_active_mouse = false;
                    var is_active_mouse_x = 0;
                    var event_mouse_x = 0;
                    elem_parent.find('*').each(function() {
                        $(this).on('click', function(e) {
                            if (event_mouse_x != 0) {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }
                            is_active_mouse = false;
                        });
                        $(this).on('mousedown', function(e) {
                            e.preventDefault();
                            e.cancelBubble = true;
                        });
                    });
                    elem_parent.on('mousedown', function(e) {
                        if ($(base_options.self).data('initNgScrolllist')) {
                            base_options.events.mousedown(e, this);
                            is_active_mouse = true;
                            is_active_mouse_x = e.originalEvent.clientX;
                            if ($(this).offset().left > $(base_options.self).offset().left) {
                                var width_left = ($(this).offset().left - $(base_options.self).offset().left);
                                is_active_mouse_x = is_active_mouse_x + width_left;
                            }
                            scrollUpdateButtons();
                            base_options.events.update('mousedown', base_options.getOptions());
                        }
                    });
                    elem_parent.on('mousemove', function(e) {
                        if (is_active_mouse && $(base_options.self).data('initNgScrolllist')) {
                            base_options.events.mousemove(e, this);
                            var cord_x = is_active_mouse_x - e.originalEvent.clientX;
                            $(this).scrollLeft(cord_x).css('-moz-user-select', 'none');
                            event_mouse_x += 1;
                            scrollUpdateButtons();
                            base_options.events.update('mousemove', base_options.getOptions());
                            return false;
                        }
                    });
                    function stopMouse(self, e) {
                        if ($(base_options.self).data('initNgScrolllist')) {
                            base_options.events.mouseup(e, self);
                            is_active_mouse = false;
                            is_active_mouse_x = 0;
                            setTimeout(function() {
                                event_mouse_x = 0;
                            }, 10);
                            scrollUpdateButtons();
                            base_options.events.update('mouseup', base_options.getOptions());
                        }
                    }
                    $(base_options.self).parent().on('mouseup', function(e) {
                        stopMouse(this, e);
                    });
                    $(base_options.self).parent().hover(function(){}, function(e) {
                        stopMouse(this, e);
                    });
                }
                elem_parent.on('scroll', function() {
                    scrollUpdateButtons();
                });
                $(window).on('resize', function() {
                    if ($(base_options.self).data('initNgScrolllist')) {
                        if (base_options.resize.active) {
                            base_options.events.resize();
                            if (base_options.resize.active_update_left) {
                                elem_parent.scrollLeft(base_options.resize.update_left);
                            }
                        }
                        scrollUpdateButtons();
                        base_options.events.update('resize', base_options.getOptions());
                    }
                });
            }

            function scrollIndexElem(index, left, time, end_time_callback) {
                left = left == undefined ? 0 : left;
                time = time == undefined ? base_options.start_index_time : time;
                if ($(base_options.self).data('initNgScrolllist')) {
                    var elem_parent = $(base_options.self).parent();
                    var elem = $(base_options.self).find('> *:nth-child(' + (index + 1) + ')');
                    if ($(elem).length > 0) {
                        var scroll_left = $(elem).offset().left - left;
                        base_options.events.scrollIndexElem('start_scroll_index', elem_parent, scroll_left, base_options);
                        elem_parent.animate({scrollLeft: scroll_left}, time, function (e) {
                            if (end_time_callback != undefined) {
                                end_time_callback(e, base_options.getOptions());
                            }
                            base_options.events.scrollIndexElem('end_scroll_index', elem_parent, scroll_left, base_options);
                            base_options.events.update('scroll_index_elem_end', base_options.getOptions());
                        });
                        base_options.events.update('scroll_index_elem', base_options.getOptions());
                    }
                }
            }

            function clickScrollLeft() {
                if (base_options.active_nav_btn) {
                    var elem_btn_prev = getElemBtnNavPrev();
                    var elem_parent = $(base_options.self).parent();
                    elem_btn_prev.on('click', function() {
                        if ($(base_options.self).data('initNgScrolllist')) {
                            base_options.events.clickScrollLeftBefore(elem_btn_prev, elem_parent);
                            var x_left = elem_parent.offset().left;
                            var break_each = false;
                            $(base_options.self).children().each(function(index) {
                                var x_elem_left = $(this).offset().left;
                                var x_elem_width = x_elem_left + $(this).outerWidth(true);
                                if (x_elem_width + 1 >= x_left && x_elem_left + 1 < x_left && !break_each) {
                                    var items_move = base_options.items_move;
                                    if (base_options.nav_btn.prev.items_move) {
                                        items_move = base_options.nav_btn.prev.items_move;
                                    }
                                    if (items_move > 1) {
                                        for (var index_prev = items_move - 1; index_prev >= 1; index_prev--) {
                                            if ($(this).index() - index_prev >= 0) {
                                                var get_elem_child = $(base_options.self).children().eq($(this).index() - index_prev);
                                                if (get_elem_child.length > 0) {
                                                    x_elem_left = get_elem_child.offset().left;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    var left_content = elem_parent.offset().left;
                                    var left_box = $(base_options.self).offset().left;
                                    var width_left = left_content - left_box;
                                    var x_right = x_left - x_elem_left;
                                    var scroll_left = width_left - x_right;
                                    var animate_properties = base_options.animate.properties;
                                    animate_properties['scrollLeft'] = scroll_left;
                                    base_options.events.animateLeft(elem_parent, scroll_left, animate_properties, base_options.animate);
                                    break_each = true;
                                }
                            });
                            base_options.events.clickScrollLeftAfter(elem_btn_prev, elem_parent);
                        }
                    });
                }
            }

            function clickScrollRight() {
                if (base_options.active_nav_btn) {
                    var elem_btn_next = getElemBtnNavNext();
                    var elem_parent = $(base_options.self).parent();
                    elem_btn_next.on('click', function() {
                        if ($(base_options.self).data('initNgScrolllist')) {
                            base_options.events.clickScrollRightBefore(elem_btn_next, elem_parent);
                            var x_right = elem_parent.offset().left + elem_parent.outerWidth(true);
                            var break_each = false;
                            $(base_options.self).children().each(function() {
                                var x_elem_right = $(this).offset().left + $(this).outerWidth(true);
                                if (x_right < x_elem_right - 1 && !break_each) {
                                    var items_move = base_options.items_move;
                                    if (base_options.nav_btn.next.items_move) {
                                        items_move = base_options.nav_btn.next.items_move;
                                    }
                                    if (items_move > 1) {
                                        for (var index_next = 1; index_next <= items_move - 1; index_next++) {
                                            var get_elem_child = $(base_options.self).children().eq($(this).index() + index_next);
                                            if (get_elem_child.length > 0) {
                                                x_elem_right = get_elem_child.offset().left + get_elem_child.outerWidth(true);
                                            }
                                        }
                                    }
                                    var left_content = elem_parent.offset().left;
                                    var left_box = $(base_options.self).offset().left;
                                    var width_left = left_content - left_box;
                                    var x_left = x_elem_right - x_right;
                                    var scroll_left = width_left + x_left + 1;
                                    var animate_properties = base_options.animate.properties;
                                    animate_properties['scrollLeft'] = scroll_left;
                                    base_options.events.animateLeft(elem_parent, scroll_left, animate_properties, base_options.animate);
                                    break_each = true;
                                }
                            });
                            base_options.events.clickScrollRightAfter(elem_btn_next, elem_parent);
                        }
                    });
                }
            }

            function scrollUpdateButtons() {
                if (base_options.active_nav_btn) {
                    var elem_btn_prev = getElemBtnNavPrev();
                    var elem_btn_next = getElemBtnNavNext();
                    var elem_parent = $(base_options.self).parent();
                    if (elem_parent.offset().left - 2 > $(base_options.self).offset().left) {
                        elem_btn_prev.removeClass('disabled');
                    } else {
                        elem_btn_prev.addClass('disabled');
                    }
                    if (elem_parent.offset().left + elem_parent.outerWidth(true) < $(base_options.self).offset().left + $(base_options.self).outerWidth(true) - 2) {
                        elem_btn_next.removeClass('disabled');
                    } else {
                        elem_btn_next.addClass('disabled');
                    }
                    base_options.events.scrollUpdateButtons(elem_btn_prev, elem_btn_next);
                }
            }

            function getElemBtnNavPrev() {
                var elem_btn_prev = base_options.nav_btn.prev.elem;
                if (elem_btn_prev == undefined) {
                    return $('.' + base_options.lining.js_class_btn_prev);
                }
                return $(elem_btn_prev);
            }

            function getElemBtnNavNext() {
                var elem_btn_next = base_options.nav_btn.next.elem;
                if (elem_btn_next == undefined) {
                    return $('.' + base_options.lining.js_class_btn_next);
                }
                return $(elem_btn_next);
            }

            this.ngscrolllist = (function() {
                if (base_options.check_init && !$(base_options.self).data('initNgScrolllist') || !base_options.check_init) {
                    elemWrap();
                    initScroll();
                    base_options.events.initPlugin(base_options);
                    $(base_options.self).data('initNgScrolllist', true);
                    $(base_options.self).addClass(base_options.lining.block_loader.class).parent().addClass(base_options.lining.parent_block_loader.class);

                    if (base_options.start_index_auto) {
                        var class_active_start_elem = base_options.lining.active_start_elem.class;
                        var start_index = 0;
                        $(base_options.self).find('> *').each(function(index) {
                            if ($(this).is('.' + class_active_start_elem)) {
                                start_index = index;
                            }
                        });
                        if (start_index != 0) {
                            scrollIndexElem(start_index, base_options.start_index_width_left);
                        }
                    } else {
                        if (base_options.start_index != 0) {
                            scrollIndexElem(base_options.start_index, base_options.start_index_width_left);
                        }
                    }
                }
                return {
                    setOptions: function(options) {
                        base_options.setOptions(options);
                    },
                    getOptions: function() {
                        return base_options.getOptions();
                    },
                    scrollUpdateButtons: function() {
                        scrollUpdateButtons();
                    },
                    scrollIndexElem: function(index, width_left, time, end_time_callback) {
                        scrollIndexElem(index, width_left, time, end_time_callback);
                    },
                    update: function() {
                        base_options.events.update('fun_update', base_options.getOptions());
                    },
                    destroy: function() {
                        if ($(base_options.self).parent().is('.' + base_options.lining.js_class_parent_block) && $(base_options.self).data('ngscrolllist_add_wrap')) {
                            $(base_options.self).unwrap();
                            $(base_options.self).removeData('ngscrolllist_add_wrap')
                        } else if (!$(base_options.self).data('ngscrolllist_add_wrap')) {
                            $(base_options.self).parent().removeClass(base_options.lining.parent_block_loader.class);
                        }
                        if ($(base_options.nav_btn.prev.elem).length) {
                            $(base_options.nav_btn.prev.elem).remove();
                        }
                        if ($(base_options.nav_btn.next.elem).length) {
                            $(base_options.nav_btn.next.elem).remove();
                        }
                        if ($(base_options.self).data('ngscrolllist_add_class_block')) {
                            $(base_options.self).removeClass(base_options.lining.block.class);
                            $(base_options.self).removeData('ngscrolllist_add_class_block');
                        }
                        if ($(base_options.self).data('ngscrolllist_add_class_parent_block')) {
                            $(base_options.self).parent().removeClass(base_options.lining.parent_block.class);
                            $(base_options.self).removeData('ngscrolllist_add_class_parent_block');
                        }
                        $(base_options.self).removeClass(base_options.lining.block_loader.class);
                        $(base_options.self).removeData('initNgScrolllist');
                    },
                };
            })();
            return this;
        });
    };
})(jQuery);