/**! ngscrolllist - v1.0.0
* https://divleaf.ru/ru/
* Copyright (c) 2024-2024 Goryachev Nikolay; */
(function($){
  jQuery.fn.ngscrolllist = function(options) {
    options = options == undefined ? {} : options;
    return $(this).map(function() {
        var base_options = $.extend(true, {
            self: this,
            events: {
                initPlugin: function() {},
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
            check_init: true, // проверять инициализацию, чтобы повторно запустить плагин для элемента
            items_move: 1,
            display_nav_btn: true,
            active_nav_btn: true,
            active_dragdrop: true,
            nav_btn: {
                prev: {
                    items_move: 0,
                    content: 'prev',
                    elem: undefined,
                },
                next: {
                    items_move: 0,
                    content: 'next',
                    elem: undefined,
                },
            },
            lining: {
                'class_block': 'ngscrolllist',
                'class_block_loader': 'ngscrolllist--loader',
                'name_selector_btn_prev' : 'button',
                'class_btn_prev': 'ngscrolllist_prev-nav-btn',
                'js_class_btn_prev': 'js-ngscrolllist_prev-nav-btn',
                'attrs_btn_prev' : {},
                'name_selector_btn_next' : 'button',
                'class_btn_next': 'ngscrolllist_next-nav-btn',
                'js_class_btn_next': 'js-ngscrolllist_next-nav-btn',
                'attrs_btn_next' : {},
                'name_selector_parent_block' : 'div',
                'attrs_parent_block' : {},
                'class_parent_block' : 'ngscrolllist_parent-block',
                'class_parent_block_loader' : 'ngscrolllist_parent-block--loader',
                'js_class_parent_block' : 'js-ngscrolllist_parent-block',
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
            if (!$(base_options.self).is('.' + base_options.lining.class_block)) {
                $(base_options.self).data('ngscrolllist_add_class_block', true);
                $(base_options.self).addClass(base_options.lining.class_block);
            }
            $(base_options.self).wrap(
                strCollectElement(
                    base_options.lining.name_selector_parent_block, 
                    base_options.lining.attrs_parent_block, 
                    (base_options.lining.class_parent_block + ' ' + base_options.lining.js_class_parent_block).trim()
                )
            );
            if (base_options.active_nav_btn && base_options.display_nav_btn) {
                base_options.nav_btn.prev.elem = $(strCollectElement(
                    base_options.lining.name_selector_btn_prev,
                    base_options.lining.attrs_btn_prev, 
                    (base_options.lining.class_btn_prev + ' ' + base_options.lining.js_class_btn_prev).trim(),
                    base_options.nav_btn.prev.content
                ));
                base_options.nav_btn.next.elem = $(strCollectElement(
                    base_options.lining.name_selector_btn_next,
                    base_options.lining.attrs_btn_next, 
                    (base_options.lining.class_btn_next + ' ' + base_options.lining.js_class_btn_next).trim(),
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

        function initScroll() {
            clickScrollLeft();
            clickScrollRight();
            scrollUpdateButtons();
            base_options.events.update('init_scroll', base_options.getOptions());
            var elem_parent = $(base_options.self).parent();
            if (base_options.active_dragdrop) {
                var is_active_mouse = false;
                var is_active_mouse_x = 0;
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
                        scrollUpdateButtons();
                        base_options.events.update('mousemove', base_options.getOptions());
                        return false;
                    }
                });
                $(base_options.self).parent().on('mouseup', function(e) {
                    if ($(base_options.self).data('initNgScrolllist')) {
                        base_options.events.mouseup(e, this);
                        is_active_mouse = false;
                        is_active_mouse_x = 0;
                        scrollUpdateButtons();
                        base_options.events.update('mouseup', base_options.getOptions());
                    }
                });
            }
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
                if (elem_parent.offset().left > $(base_options.self).offset().left) {
                    elem_btn_prev.removeClass('disabled');
                } else {
                    elem_btn_prev.addClass('disabled');
                }
                if (elem_parent.offset().left + elem_parent.outerWidth(true) < $(base_options.self).offset().left + $(base_options.self).outerWidth(true)) {
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
                $(base_options.self).addClass(base_options.lining.class_block_loader).parent().addClass(base_options.lining.class_parent_block_loader);
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
                update: function() {
                    base_options.events.update('fun_update', base_options.getOptions());
                }, 
                destroy: function() {
                    if ($(base_options.self).parent().is('.' + base_options.lining.js_class_parent_block)) {
                        $(base_options.self).unwrap();
                    }
                    if ($(base_options.nav_btn.prev.elem).length) {
                        $(base_options.nav_btn.prev.elem).remove();
                    }
                    if ($(base_options.nav_btn.next.elem).length) {
                        $(base_options.nav_btn.next.elem).remove();
                    }
                    if ($(base_options.self).data('ngscrolllist_add_class_block')) {
                        $(base_options.self).removeClass(base_options.lining.class_block);
                        $(base_options.self).removeData('ngscrolllist_add_class_block');
                    }
                    $(base_options.self).removeClass(base_options.lining.class_block_loader);
                    $(base_options.self).removeData('initNgScrolllist');
                },
            };
        })();
        return this;
    });
  };
})(jQuery);