/* ========================================================================
 * Bootstrap: transition.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: https://modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // https://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#modals
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options = options
    this.$body = $(document.body)
    this.$element = $(element)
    this.$dialog = this.$element.find('.modal-dialog')
    this.$backdrop = null
    this.isShown = null
    this.originalBodyPad = null
    this.scrollbarWidth = 0
    this.ignoreBackdropClick = false
    this.fixedContent = '.navbar-fixed-top, .navbar-fixed-bottom'

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION = '3.4.1'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
          this.$element[0] !== e.target &&
          !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    var scrollbarWidth = this.scrollbarWidth
    if (this.bodyIsOverflowing) {
      this.$body.css('padding-right', bodyPad + scrollbarWidth)
      $(this.fixedContent).each(function (index, element) {
        var actualPadding = element.style.paddingRight
        var calculatedPadding = $(element).css('padding-right')
        $(element)
          .data('padding-right', actualPadding)
          .css('padding-right', parseFloat(calculatedPadding) + scrollbarWidth + 'px')
      })
    }
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
    $(this.fixedContent).each(function (index, element) {
      var padding = $(element).data('padding-right')
      $(element).removeData('padding-right')
      element.style.paddingRight = padding ? padding : ''
    })
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
    var href = $this.attr('href')
    var target = $this.attr('data-target') ||
      (href && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7

    var $target = $(document).find(target)
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.4.1'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector !== '#' ? $(document).find(selector) : null

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.4.1'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(document).find(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(document).find(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.4.1'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(document).find(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
          .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

'use strict';

(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['jquery'], factory);
  } else if(typeof module === 'object' && module.exports) {
    factory(require('jquery'));
  } else {
    factory(root.jQuery);
  }
}(this, function($) {

	var version = '2.1.6';

	$.fn.cycle = function( options ) {
	    // fix mistakes with the ready state
	    var o;
	    if ( this.length === 0 && !$.isReady ) {
	        o = { s: this.selector, c: this.context };
	        $.fn.cycle.log('requeuing slideshow (dom not ready)');
	        $(function() {
	            $( o.s, o.c ).cycle(options);
	        });
	        return this;
	    }

	    return this.each(function() {
	        var data, opts, shortName, val;
	        var container = $(this);
	        var log = $.fn.cycle.log;

	        if ( container.data('cycle.opts') )
	            return; // already initialized

	        if ( container.data('cycle-log') === false || 
	            ( options && options.log === false ) ||
	            ( opts && opts.log === false) ) {
	            log = $.noop;
	        }

	        log('--c2 init--');
	        data = container.data();
	        for (var p in data) {
	            // allow props to be accessed sans 'cycle' prefix and log the overrides
	            if (data.hasOwnProperty(p) && /^cycle[A-Z]+/.test(p) ) {
	                val = data[p];
	                shortName = p.match(/^cycle(.*)/)[1].replace(/^[A-Z]/, lowerCase);
	                log(shortName+':', val, '('+typeof val +')');
	                data[shortName] = val;
	            }
	        }

	        opts = $.extend( {}, $.fn.cycle.defaults, data, options || {});

	        opts.timeoutId = 0;
	        opts.paused = opts.paused || false; // #57
	        opts.container = container;
	        opts._maxZ = opts.maxZ;

	        opts.API = $.extend ( { _container: container }, $.fn.cycle.API );
	        opts.API.log = log;
	        opts.API.trigger = function( eventName, args ) {
	            opts.container.trigger( eventName, args );
	            return opts.API;
	        };

	        container.data( 'cycle.opts', opts );
	        container.data( 'cycle.API', opts.API );

	        // opportunity for plugins to modify opts and API
	        opts.API.trigger('cycle-bootstrap', [ opts, opts.API ]);

	        opts.API.addInitialSlides();
	        opts.API.preInitSlideshow();

	        if ( opts.slides.length )
	            opts.API.initSlideshow();
	    });
	};

	$.fn.cycle.API = {
	    opts: function() {
	        return this._container.data( 'cycle.opts' );
	    },
	    addInitialSlides: function() {
	        var opts = this.opts();
	        var slides = opts.slides;
	        opts.slideCount = 0;
	        opts.slides = $(); // empty set
	        
	        // add slides that already exist
	        slides = slides.jquery ? slides : opts.container.find( slides );

	        if ( opts.random ) {
	            slides.sort(function() {return Math.random() - 0.5;});
	        }

	        opts.API.add( slides );
	    },

	    preInitSlideshow: function() {
	        var opts = this.opts();
	        opts.API.trigger('cycle-pre-initialize', [ opts ]);
	        var tx = $.fn.cycle.transitions[opts.fx];
	        if (tx && $.isFunction(tx.preInit))
	            tx.preInit( opts );
	        opts._preInitialized = true;
	    },

	    postInitSlideshow: function() {
	        var opts = this.opts();
	        opts.API.trigger('cycle-post-initialize', [ opts ]);
	        var tx = $.fn.cycle.transitions[opts.fx];
	        if (tx && $.isFunction(tx.postInit))
	            tx.postInit( opts );
	    },

	    initSlideshow: function() {
	        var opts = this.opts();
	        var pauseObj = opts.container;
	        var slideOpts;
	        opts.API.calcFirstSlide();

	        if ( opts.container.css('position') == 'static' )
	            opts.container.css('position', 'relative');

	        $(opts.slides[opts.currSlide]).css({
	            opacity: 1,
	            display: 'block',
	            visibility: 'visible'
	        });
	        opts.API.stackSlides( opts.slides[opts.currSlide], opts.slides[opts.nextSlide], !opts.reverse );

	        if ( opts.pauseOnHover ) {
	            // allow pauseOnHover to specify an element
	            if ( opts.pauseOnHover !== true )
	                pauseObj = $( opts.pauseOnHover );

	            pauseObj.hover(
	                function(){ opts.API.pause( true ); }, 
	                function(){ opts.API.resume( true ); }
	            );
	        }

	        // stage initial transition
	        if ( opts.timeout ) {
	            slideOpts = opts.API.getSlideOpts( opts.currSlide );
	            opts.API.queueTransition( slideOpts, slideOpts.timeout + opts.delay );
	        }

	        opts._initialized = true;
	        opts.API.updateView( true );
	        opts.API.trigger('cycle-initialized', [ opts ]);
	        opts.API.postInitSlideshow();
	    },

	    pause: function( hover ) {
	        var opts = this.opts(),
	            slideOpts = opts.API.getSlideOpts(),
	            alreadyPaused = opts.hoverPaused || opts.paused;

	        if ( hover )
	            opts.hoverPaused = true; 
	        else
	            opts.paused = true;

	        if ( ! alreadyPaused ) {
	            opts.container.addClass('cycle-paused');
	            opts.API.trigger('cycle-paused', [ opts ]).log('cycle-paused');

	            if ( slideOpts.timeout ) {
	                clearTimeout( opts.timeoutId );
	                opts.timeoutId = 0;
	                
	                // determine how much time is left for the current slide
	                opts._remainingTimeout -= ( $.now() - opts._lastQueue );
	                if ( opts._remainingTimeout < 0 || isNaN(opts._remainingTimeout) )
	                    opts._remainingTimeout = undefined;
	            }
	        }
	    },

	    resume: function( hover ) {
	        var opts = this.opts(),
	            alreadyResumed = !opts.hoverPaused && !opts.paused,
	            remaining;

	        if ( hover )
	            opts.hoverPaused = false; 
	        else
	            opts.paused = false;

	    
	        if ( ! alreadyResumed ) {
	            opts.container.removeClass('cycle-paused');
	            // #gh-230; if an animation is in progress then don't queue a new transition; it will
	            // happen naturally
	            if ( opts.slides.filter(':animated').length === 0 )
	                opts.API.queueTransition( opts.API.getSlideOpts(), opts._remainingTimeout );
	            opts.API.trigger('cycle-resumed', [ opts, opts._remainingTimeout ] ).log('cycle-resumed');
	        }
	    },

	    add: function( slides, prepend ) {
	        var opts = this.opts();
	        var oldSlideCount = opts.slideCount;
	        var startSlideshow = false;
	        var len;

	        if ( $.type(slides) == 'string')
	            slides = $.trim( slides );

	        $( slides ).each(function(i) {
	            var slideOpts;
	            var slide = $(this);

	            if ( prepend )
	                opts.container.prepend( slide );
	            else
	                opts.container.append( slide );

	            opts.slideCount++;
	            slideOpts = opts.API.buildSlideOpts( slide );

	            if ( prepend )
	                opts.slides = $( slide ).add( opts.slides );
	            else
	                opts.slides = opts.slides.add( slide );

	            opts.API.initSlide( slideOpts, slide, --opts._maxZ );

	            slide.data('cycle.opts', slideOpts);
	            opts.API.trigger('cycle-slide-added', [ opts, slideOpts, slide ]);
	        });

	        opts.API.updateView( true );

	        startSlideshow = opts._preInitialized && (oldSlideCount < 2 && opts.slideCount >= 1);
	        if ( startSlideshow ) {
	            if ( !opts._initialized )
	                opts.API.initSlideshow();
	            else if ( opts.timeout ) {
	                len = opts.slides.length;
	                opts.nextSlide = opts.reverse ? len - 1 : 1;
	                if ( !opts.timeoutId ) {
	                    opts.API.queueTransition( opts );
	                }
	            }
	        }
	    },

	    calcFirstSlide: function() {
	        var opts = this.opts();
	        var firstSlideIndex;
	        firstSlideIndex = parseInt( opts.startingSlide || 0, 10 );
	        if (firstSlideIndex >= opts.slides.length || firstSlideIndex < 0)
	            firstSlideIndex = 0;

	        opts.currSlide = firstSlideIndex;
	        if ( opts.reverse ) {
	            opts.nextSlide = firstSlideIndex - 1;
	            if (opts.nextSlide < 0)
	                opts.nextSlide = opts.slides.length - 1;
	        }
	        else {
	            opts.nextSlide = firstSlideIndex + 1;
	            if (opts.nextSlide == opts.slides.length)
	                opts.nextSlide = 0;
	        }
	    },

	    calcNextSlide: function() {
	        var opts = this.opts();
	        var roll;
	        if ( opts.reverse ) {
	            roll = (opts.nextSlide - 1) < 0;
	            opts.nextSlide = roll ? opts.slideCount - 1 : opts.nextSlide-1;
	            opts.currSlide = roll ? 0 : opts.nextSlide+1;
	        }
	        else {
	            roll = (opts.nextSlide + 1) == opts.slides.length;
	            opts.nextSlide = roll ? 0 : opts.nextSlide+1;
	            opts.currSlide = roll ? opts.slides.length-1 : opts.nextSlide-1;
	        }
	    },

	    calcTx: function( slideOpts, manual ) {
	        var opts = slideOpts;
	        var tx;

	        if ( opts._tempFx )
	            tx = $.fn.cycle.transitions[opts._tempFx];
	        else if ( manual && opts.manualFx )
	            tx = $.fn.cycle.transitions[opts.manualFx];

	        if ( !tx )
	            tx = $.fn.cycle.transitions[opts.fx];

	        opts._tempFx = null;
	        this.opts()._tempFx = null;

	        if (!tx) {
	            tx = $.fn.cycle.transitions.fade;
	            opts.API.log('Transition "' + opts.fx + '" not found.  Using fade.');
	        }
	        return tx;
	    },

	    prepareTx: function( manual, fwd ) {
	        var opts = this.opts();
	        var after, curr, next, slideOpts, tx;

	        if ( opts.slideCount < 2 ) {
	            opts.timeoutId = 0;
	            return;
	        }
	        if ( manual && ( !opts.busy || opts.manualTrump ) ) {
	            opts.API.stopTransition();
	            opts.busy = false;
	            clearTimeout(opts.timeoutId);
	            opts.timeoutId = 0;
	        }
	        if ( opts.busy )
	            return;
	        if ( opts.timeoutId === 0 && !manual )
	            return;

	        curr = opts.slides[opts.currSlide];
	        next = opts.slides[opts.nextSlide];
	        slideOpts = opts.API.getSlideOpts( opts.nextSlide );
	        tx = opts.API.calcTx( slideOpts, manual );

	        opts._tx = tx;

	        if ( manual && slideOpts.manualSpeed !== undefined )
	            slideOpts.speed = slideOpts.manualSpeed;

	        // if ( opts.nextSlide === opts.currSlide )
	        //     opts.API.calcNextSlide();

	        // ensure that:
	        //      1. advancing to a different slide
	        //      2. this is either a manual event (prev/next, pager, cmd) or 
	        //              a timer event and slideshow is not paused
	        if ( opts.nextSlide != opts.currSlide && 
	            (manual || (!opts.paused && !opts.hoverPaused && opts.timeout) )) { // #62

	            opts.API.trigger('cycle-before', [ slideOpts, curr, next, fwd ]);
	            if ( tx.before )
	                tx.before( slideOpts, curr, next, fwd );

	            after = function() {
	                opts.busy = false;
	                // #76; bail if slideshow has been destroyed
	                if (! opts.container.data( 'cycle.opts' ) )
	                    return;

	                if (tx.after)
	                    tx.after( slideOpts, curr, next, fwd );
	                opts.API.trigger('cycle-after', [ slideOpts, curr, next, fwd ]);
	                opts.API.queueTransition( slideOpts);
	                opts.API.updateView( true );
	            };

	            opts.busy = true;
	            if (tx.transition)
	                tx.transition(slideOpts, curr, next, fwd, after);
	            else
	                opts.API.doTransition( slideOpts, curr, next, fwd, after);

	            opts.API.calcNextSlide();
	            opts.API.updateView();
	        } else {
	            opts.API.queueTransition( slideOpts );
	        }
	    },

	    // perform the actual animation
	    doTransition: function( slideOpts, currEl, nextEl, fwd, callback) {
	        var opts = slideOpts;
	        var curr = $(currEl), next = $(nextEl);
	        var fn = function() {
	            // make sure animIn has something so that callback doesn't trigger immediately
	            next.animate(opts.animIn || { opacity: 1}, opts.speed, opts.easeIn || opts.easing, callback);
	        };

	        next.css(opts.cssBefore || {});
	        curr.animate(opts.animOut || {}, opts.speed, opts.easeOut || opts.easing, function() {
	            curr.css(opts.cssAfter || {});
	            if (!opts.sync) {
	                fn();
	            }
	        });
	        if (opts.sync) {
	            fn();
	        }
	    },

	    queueTransition: function( slideOpts, specificTimeout ) {
	        var opts = this.opts();
	        var timeout = specificTimeout !== undefined ? specificTimeout : slideOpts.timeout;
	        if (opts.nextSlide === 0 && --opts.loop === 0) {
	            opts.API.log('terminating; loop=0');
	            opts.timeout = 0;
	            if ( timeout ) {
	                setTimeout(function() {
	                    opts.API.trigger('cycle-finished', [ opts ]);
	                }, timeout);
	            }
	            else {
	                opts.API.trigger('cycle-finished', [ opts ]);
	            }
	            // reset nextSlide
	            opts.nextSlide = opts.currSlide;
	            return;
	        }
	        if ( opts.continueAuto !== undefined ) {
	            if ( opts.continueAuto === false || 
	                ($.isFunction(opts.continueAuto) && opts.continueAuto() === false )) {
	                opts.API.log('terminating automatic transitions');
	                opts.timeout = 0;
	                if ( opts.timeoutId )
	                    clearTimeout(opts.timeoutId);
	                return;
	            }
	        }
	        if ( timeout ) {
	            opts._lastQueue = $.now();
	            if ( specificTimeout === undefined )
	                opts._remainingTimeout = slideOpts.timeout;

	            if ( !opts.paused && ! opts.hoverPaused ) {
	                opts.timeoutId = setTimeout(function() { 
	                    opts.API.prepareTx( false, !opts.reverse ); 
	                }, timeout );
	            }
	        }
	    },

	    stopTransition: function() {
	        var opts = this.opts();
	        if ( opts.slides.filter(':animated').length ) {
	            opts.slides.stop(false, true);
	            opts.API.trigger('cycle-transition-stopped', [ opts ]);
	        }

	        if ( opts._tx && opts._tx.stopTransition )
	            opts._tx.stopTransition( opts );
	    },

	    // advance slide forward or back
	    advanceSlide: function( val ) {
	        var opts = this.opts();
	        clearTimeout(opts.timeoutId);
	        opts.timeoutId = 0;
	        opts.nextSlide = opts.currSlide + val;
	        
	        if (opts.nextSlide < 0)
	            opts.nextSlide = opts.slides.length - 1;
	        else if (opts.nextSlide >= opts.slides.length)
	            opts.nextSlide = 0;

	        opts.API.prepareTx( true,  val >= 0 );
	        return false;
	    },

	    buildSlideOpts: function( slide ) {
	        var opts = this.opts();
	        var val, shortName;
	        var slideOpts = slide.data() || {};
	        for (var p in slideOpts) {
	            // allow props to be accessed sans 'cycle' prefix and log the overrides
	            if (slideOpts.hasOwnProperty(p) && /^cycle[A-Z]+/.test(p) ) {
	                val = slideOpts[p];
	                shortName = p.match(/^cycle(.*)/)[1].replace(/^[A-Z]/, lowerCase);
	                opts.API.log('['+(opts.slideCount-1)+']', shortName+':', val, '('+typeof val +')');
	                slideOpts[shortName] = val;
	            }
	        }

	        slideOpts = $.extend( {}, $.fn.cycle.defaults, opts, slideOpts );
	        slideOpts.slideNum = opts.slideCount;

	        try {
	            // these props should always be read from the master state object
	            delete slideOpts.API;
	            delete slideOpts.slideCount;
	            delete slideOpts.currSlide;
	            delete slideOpts.nextSlide;
	            delete slideOpts.slides;
	        } catch(e) {
	            // no op
	        }
	        return slideOpts;
	    },

	    getSlideOpts: function( index ) {
	        var opts = this.opts();
	        if ( index === undefined )
	            index = opts.currSlide;

	        var slide = opts.slides[index];
	        var slideOpts = $(slide).data('cycle.opts');
	        return $.extend( {}, opts, slideOpts );
	    },
	    
	    initSlide: function( slideOpts, slide, suggestedZindex ) {
	        var opts = this.opts();
	        slide.css( slideOpts.slideCss || {} );
	        if ( suggestedZindex > 0 )
	            slide.css( 'zIndex', suggestedZindex );

	        // ensure that speed settings are sane
	        if ( isNaN( slideOpts.speed ) )
	            slideOpts.speed = $.fx.speeds[slideOpts.speed] || $.fx.speeds._default;
	        if ( !slideOpts.sync )
	            slideOpts.speed = slideOpts.speed / 2;

	        slide.addClass( opts.slideClass );
	    },

	    updateView: function( isAfter, isDuring, forceEvent ) {
	        var opts = this.opts();
	        if ( !opts._initialized )
	            return;
	        var slideOpts = opts.API.getSlideOpts();
	        var currSlide = opts.slides[ opts.currSlide ];

	        if ( ! isAfter && isDuring !== true ) {
	            opts.API.trigger('cycle-update-view-before', [ opts, slideOpts, currSlide ]);
	            if ( opts.updateView < 0 )
	                return;
	        }

	        if ( opts.slideActiveClass ) {
	            opts.slides.removeClass( opts.slideActiveClass )
	                .eq( opts.currSlide ).addClass( opts.slideActiveClass );
	        }

	        if ( isAfter && opts.hideNonActive )
	            opts.slides.filter( ':not(.' + opts.slideActiveClass + ')' ).css('visibility', 'hidden');

	        if ( opts.updateView === 0 ) {
	            setTimeout(function() {
	                opts.API.trigger('cycle-update-view', [ opts, slideOpts, currSlide, isAfter ]);
	            }, slideOpts.speed / (opts.sync ? 2 : 1) );
	        }

	        if ( opts.updateView !== 0 )
	            opts.API.trigger('cycle-update-view', [ opts, slideOpts, currSlide, isAfter ]);
	        
	        if ( isAfter )
	            opts.API.trigger('cycle-update-view-after', [ opts, slideOpts, currSlide ]);
	    },

	    getComponent: function( name ) {
	        var opts = this.opts();
	        var selector = opts[name];
	        if (typeof selector === 'string') {
	            // if selector is a child, sibling combinator, adjancent selector then use find, otherwise query full dom
	            return (/^\s*[\>|\+|~]/).test( selector ) ? opts.container.find( selector ) : $( selector );
	        }
	        if (selector.jquery)
	            return selector;
	        
	        return $(selector);
	    },

	    stackSlides: function( curr, next, fwd ) {
	        var opts = this.opts();
	        if ( !curr ) {
	            curr = opts.slides[opts.currSlide];
	            next = opts.slides[opts.nextSlide];
	            fwd = !opts.reverse;
	        }

	        // reset the zIndex for the common case:
	        // curr slide on top,  next slide beneath, and the rest in order to be shown
	        $(curr).css('zIndex', opts.maxZ);

	        var i;
	        var z = opts.maxZ - 2;
	        var len = opts.slideCount;
	        if (fwd) {
	            for ( i = opts.currSlide + 1; i < len; i++ )
	                $( opts.slides[i] ).css( 'zIndex', z-- );
	            for ( i = 0; i < opts.currSlide; i++ )
	                $( opts.slides[i] ).css( 'zIndex', z-- );
	        }
	        else {
	            for ( i = opts.currSlide - 1; i >= 0; i-- )
	                $( opts.slides[i] ).css( 'zIndex', z-- );
	            for ( i = len - 1; i > opts.currSlide; i-- )
	                $( opts.slides[i] ).css( 'zIndex', z-- );
	        }

	        $(next).css('zIndex', opts.maxZ - 1);
	    },

	    getSlideIndex: function( el ) {
	        return this.opts().slides.index( el );
	    }

	}; // API

	// default logger
	$.fn.cycle.log = function log() {
	    /*global console:true */
	    if (window.console && console.log)
	        console.log('[cycle2] ' + Array.prototype.join.call(arguments, ' ') );
	};

	$.fn.cycle.version = function() { return 'Cycle2: ' + version; };

	// helper functions

	function lowerCase(s) {
	    return (s || '').toLowerCase();
	}

	// expose transition object
	$.fn.cycle.transitions = {
	    custom: {
	    },
	    none: {
	        before: function( opts, curr, next, fwd ) {
	            opts.API.stackSlides( next, curr, fwd );
	            opts.cssBefore = { opacity: 1, visibility: 'visible', display: 'block' };
	        }
	    },
	    fade: {
	        before: function( opts, curr, next, fwd ) {
	            var css = opts.API.getSlideOpts( opts.nextSlide ).slideCss || {};
	            opts.API.stackSlides( curr, next, fwd );
	            opts.cssBefore = $.extend(css, { opacity: 0, visibility: 'visible', display: 'block' });
	            opts.animIn = { opacity: 1 };
	            opts.animOut = { opacity: 0 };
	        }
	    },
	    fadeout: {
	        before: function( opts , curr, next, fwd ) {
	            var css = opts.API.getSlideOpts( opts.nextSlide ).slideCss || {};
	            opts.API.stackSlides( curr, next, fwd );
	            opts.cssBefore = $.extend(css, { opacity: 1, visibility: 'visible', display: 'block' });
	            opts.animOut = { opacity: 0 };
	        }
	    },
	    scrollHorz: {
	        before: function( opts, curr, next, fwd ) {
	            opts.API.stackSlides( curr, next, fwd );
	            var w = opts.container.css('overflow','hidden').width();
	            opts.cssBefore = { left: fwd ? w : - w, top: 0, opacity: 1, visibility: 'visible', display: 'block' };
	            opts.cssAfter = { zIndex: opts._maxZ - 2, left: 0 };
	            opts.animIn = { left: 0 };
	            opts.animOut = { left: fwd ? -w : w };
	        }
	    }
	};

	// @see: http://jquery.malsup.com/cycle2/api
	$.fn.cycle.defaults = {
	    allowWrap:        true,
	    autoSelector:     '.cycle-slideshow[data-cycle-auto-init!=false]',
	    delay:            0,
	    easing:           null,
	    fx:              'fade',
	    hideNonActive:    true,
	    loop:             0,
	    manualFx:         undefined,
	    manualSpeed:      undefined,
	    manualTrump:      true,
	    maxZ:             100,
	    pauseOnHover:     false,
	    reverse:          false,
	    slideActiveClass: 'cycle-slide-active',
	    slideClass:       'cycle-slide',
	    slideCss:         { position: 'absolute', top: 0, left: 0 },
	    slides:          '> img',
	    speed:            500,
	    startingSlide:    0,
	    sync:             true,
	    timeout:          4000,
	    updateView:       0
	};

	// automatically find and run slideshows
	$(document).ready(function() {
	    $( $.fn.cycle.defaults.autoSelector ).cycle();
	});

	$.extend($.fn.cycle.defaults, {
	    autoHeight: 0, // setting this option to false disables autoHeight logic
	    autoHeightSpeed: 250,
	    autoHeightEasing: null
	});    

	$(document).on( 'cycle-initialized', function( e, opts ) {
	    var autoHeight = opts.autoHeight;
	    var t = $.type( autoHeight );
	    var resizeThrottle = null;
	    var ratio;

	    if ( t !== 'string' && t !== 'number' )
	        return;

	    // bind events
	    opts.container.on( 'cycle-slide-added cycle-slide-removed', initAutoHeight );
	    opts.container.on( 'cycle-destroyed', onDestroy );

	    if ( autoHeight == 'container' ) {
	        opts.container.on( 'cycle-before', onBefore );
	    }
	    else if ( t === 'string' && /\d+\:\d+/.test( autoHeight ) ) { 
	        // use ratio
	        ratio = autoHeight.match(/(\d+)\:(\d+)/);
	        ratio = ratio[1] / ratio[2];
	        opts._autoHeightRatio = ratio;
	    }

	    // if autoHeight is a number then we don't need to recalculate the sentinel
	    // index on resize
	    if ( t !== 'number' ) {
	        // bind unique resize handler per slideshow (so it can be 'off-ed' in onDestroy)
	        opts._autoHeightOnResize = function () {
	            clearTimeout( resizeThrottle );
	            resizeThrottle = setTimeout( onResize, 50 );
	        };

	        $(window).on( 'resize orientationchange', opts._autoHeightOnResize );
	    }

	    setTimeout( onResize, 30 );

	    function onResize() {
	        initAutoHeight( e, opts );
	    }
	});

	function initAutoHeight( e, opts ) {
	    var clone, height, sentinelIndex;
	    var autoHeight = opts.autoHeight;

	    if ( autoHeight == 'container' ) {
	        height = $( opts.slides[ opts.currSlide ] ).outerHeight();
	        opts.container.height( height );
	    }
	    else if ( opts._autoHeightRatio ) { 
	        opts.container.height( opts.container.width() / opts._autoHeightRatio );
	    }
	    else if ( autoHeight === 'calc' || ( $.type( autoHeight ) == 'number' && autoHeight >= 0 ) ) {
	        if ( autoHeight === 'calc' )
	            sentinelIndex = calcSentinelIndex( e, opts );
	        else if ( autoHeight >= opts.slides.length )
	            sentinelIndex = 0;
	        else 
	            sentinelIndex = autoHeight;

	        // only recreate sentinel if index is different
	        if ( sentinelIndex == opts._sentinelIndex )
	            return;

	        opts._sentinelIndex = sentinelIndex;
	        if ( opts._sentinel )
	            opts._sentinel.remove();

	        // clone existing slide as sentinel
	        clone = $( opts.slides[ sentinelIndex ].cloneNode(true) );
	        
	        // #50; remove special attributes from cloned content
	        clone.removeAttr( 'id name rel' ).find( '[id],[name],[rel]' ).removeAttr( 'id name rel' );

	        clone.css({
	            position: 'static',
	            visibility: 'hidden',
	            display: 'block'
	        }).prependTo( opts.container ).addClass('cycle-sentinel cycle-slide').removeClass('cycle-slide-active');
	        clone.find( '*' ).css( 'visibility', 'hidden' );

	        opts._sentinel = clone;
	    }
	}    

	function calcSentinelIndex( e, opts ) {
	    var index = 0, max = -1;

	    // calculate tallest slide index
	    opts.slides.each(function(i) {
	        var h = $(this).height();
	        if ( h > max ) {
	            max = h;
	            index = i;
	        }
	    });
	    return index;
	}

	function onBefore( e, opts, outgoing, incoming, forward ) {
	    var h = $(incoming).outerHeight();
	    opts.container.animate( { height: h }, opts.autoHeightSpeed, opts.autoHeightEasing );
	}

	function onDestroy( e, opts ) {
	    if ( opts._autoHeightOnResize ) {
	        $(window).off( 'resize orientationchange', opts._autoHeightOnResize );
	        opts._autoHeightOnResize = null;
	    }
	    opts.container.off( 'cycle-slide-added cycle-slide-removed', initAutoHeight );
	    opts.container.off( 'cycle-destroyed', onDestroy );
	    opts.container.off( 'cycle-before', onBefore );

	    if ( opts._sentinel ) {
	        opts._sentinel.remove();
	        opts._sentinel = null;
	    }
	}

	$.extend($.fn.cycle.defaults, {
	    caption:          '> .cycle-caption',
	    captionTemplate:  '{{slideNum}} / {{slideCount}}',
	    overlay:          '> .cycle-overlay',
	    overlayTemplate:  '<div>{{title}}</div><div>{{desc}}</div>',
	    captionModule:    'caption'
	});    

	$(document).on( 'cycle-update-view', function( e, opts, slideOpts, currSlide ) {
	    if ( opts.captionModule !== 'caption' )
	        return;
	    var el;
	    $.each(['caption','overlay'], function() {
	        var name = this; 
	        var template = slideOpts[name+'Template'];
	        var el = opts.API.getComponent( name );
	        if( el.length && template ) {
	            el.html( opts.API.tmpl( template, slideOpts, opts, currSlide ) );
	            el.show();
	        }
	        else {
	            el.hide();
	        }
	    });
	});

	$(document).on( 'cycle-destroyed', function( e, opts ) {
	    var el;
	    $.each(['caption','overlay'], function() {
	        var name = this, template = opts[name+'Template'];
	        if ( opts[name] && template ) {
	            el = opts.API.getComponent( 'caption' );
	            el.empty();
	        }
	    });
	});

	var c2 = $.fn.cycle;

	$.fn.cycle = function( options ) {
	    var cmd, cmdFn, opts;
	    var args = $.makeArray( arguments );

	    if ( $.type( options ) == 'number' ) {
	        return this.cycle( 'goto', options );
	    }

	    if ( $.type( options ) == 'string' ) {
	        return this.each(function() {
	            var cmdArgs;
	            cmd = options;
	            opts = $(this).data('cycle.opts');

	            if ( opts === undefined ) {
	                c2.log('slideshow must be initialized before sending commands; "' + cmd + '" ignored');
	                return;
	            }
	            else {
	                cmd = cmd == 'goto' ? 'jump' : cmd; // issue #3; change 'goto' to 'jump' internally
	                cmdFn = opts.API[ cmd ];
	                if ( $.isFunction( cmdFn )) {
	                    cmdArgs = $.makeArray( args );
	                    cmdArgs.shift();
	                    return cmdFn.apply( opts.API, cmdArgs );
	                }
	                else {
	                    c2.log( 'unknown command: ', cmd );
	                }
	            }
	        });
	    }
	    else {
	        return c2.apply( this, arguments );
	    }
	};

	// copy props
	$.extend( $.fn.cycle, c2 );

	$.extend( c2.API, {
	    next: function() {
	        var opts = this.opts();
	        if ( opts.busy && ! opts.manualTrump )
	            return;

	        var count = opts.reverse ? -1 : 1;
	        if ( opts.allowWrap === false && ( opts.currSlide + count ) >= opts.slideCount )
	            return;

	        opts.API.advanceSlide( count );
	        opts.API.trigger('cycle-next', [ opts ]).log('cycle-next');
	    },

	    prev: function() {
	        var opts = this.opts();
	        if ( opts.busy && ! opts.manualTrump )
	            return;
	        var count = opts.reverse ? 1 : -1;
	        if ( opts.allowWrap === false && ( opts.currSlide + count ) < 0 )
	            return;

	        opts.API.advanceSlide( count );
	        opts.API.trigger('cycle-prev', [ opts ]).log('cycle-prev');
	    },

	    destroy: function() {
	        this.stop(); //#204

	        var opts = this.opts();
	        var clean = $.isFunction( $._data ) ? $._data : $.noop;  // hack for #184 and #201
	        clearTimeout(opts.timeoutId);
	        opts.timeoutId = 0;
	        opts.API.stop();
	        opts.API.trigger( 'cycle-destroyed', [ opts ] ).log('cycle-destroyed');
	        opts.container.removeData();
	        clean( opts.container[0], 'parsedAttrs', false );

	        // #75; remove inline styles
	        if ( ! opts.retainStylesOnDestroy ) {
	            opts.container.removeAttr( 'style' );
	            opts.slides.removeAttr( 'style' );
	            opts.slides.removeClass( opts.slideActiveClass );
	        }
	        opts.slides.each(function() {
	            var slide = $(this);
	            slide.removeData();
	            slide.removeClass( opts.slideClass );
	            clean( this, 'parsedAttrs', false );
	        });
	    },

	    jump: function( index, fx ) {
	        // go to the requested slide
	        var fwd;
	        var opts = this.opts();
	        if ( opts.busy && ! opts.manualTrump )
	            return;
	        var num = parseInt( index, 10 );
	        if (isNaN(num) || num < 0 || num >= opts.slides.length) {
	            opts.API.log('goto: invalid slide index: ' + num);
	            return;
	        }
	        if (num == opts.currSlide) {
	            opts.API.log('goto: skipping, already on slide', num);
	            return;
	        }
	        opts.nextSlide = num;
	        clearTimeout(opts.timeoutId);
	        opts.timeoutId = 0;
	        opts.API.log('goto: ', num, ' (zero-index)');
	        fwd = opts.currSlide < opts.nextSlide;
	        opts._tempFx = fx;
	        opts.API.prepareTx( true, fwd );
	    },

	    stop: function() {
	        var opts = this.opts();
	        var pauseObj = opts.container;
	        clearTimeout(opts.timeoutId);
	        opts.timeoutId = 0;
	        opts.API.stopTransition();
	        if ( opts.pauseOnHover ) {
	            if ( opts.pauseOnHover !== true )
	                pauseObj = $( opts.pauseOnHover );
	            pauseObj.off('mouseenter mouseleave');
	        }
	        opts.API.trigger('cycle-stopped', [ opts ]).log('cycle-stopped');
	    },

	    reinit: function() {
	        var opts = this.opts();
	        opts.API.destroy();
	        opts.container.cycle();
	    },

	    remove: function( index ) {
	        var opts = this.opts();
	        var slide, slideToRemove, slides = [], slideNum = 1;
	        for ( var i=0; i < opts.slides.length; i++ ) {
	            slide = opts.slides[i];
	            if ( i == index ) {
	                slideToRemove = slide;
	            }
	            else {
	                slides.push( slide );
	                $( slide ).data('cycle.opts').slideNum = slideNum;
	                slideNum++;
	            }
	        }
	        if ( slideToRemove ) {
	            opts.slides = $( slides );
	            opts.slideCount--;
	            $( slideToRemove ).remove();
	            if (index == opts.currSlide)
	                opts.API.advanceSlide( 1 );
	            else if ( index < opts.currSlide )
	                opts.currSlide--;
	            else
	                opts.currSlide++;

	            opts.API.trigger('cycle-slide-removed', [ opts, index, slideToRemove ]).log('cycle-slide-removed');
	            opts.API.updateView();
	        }
	    }

	});

	// listen for clicks on elements with data-cycle-cmd attribute
	$(document).on('click.cycle', '[data-cycle-cmd]', function(e) {
	    // issue cycle command
	    e.preventDefault();
	    var el = $(this);
	    var command = el.data('cycle-cmd');
	    var context = el.data('cycle-context') || '.cycle-slideshow';
	    $(context).cycle(command, el.data('cycle-arg'));
	});


	$(document).on( 'cycle-pre-initialize', function( e, opts ) {
	    onHashChange( opts, true );

	    opts._onHashChange = function() {
	        onHashChange( opts, false );
	    };

	    $( window ).on( 'hashchange', opts._onHashChange);
	});

	$(document).on( 'cycle-update-view', function( e, opts, slideOpts ) {
	    if ( slideOpts.hash && ( '#' + slideOpts.hash ) != window.location.hash ) {
	        opts._hashFence = true;
	        window.location.hash = slideOpts.hash;
	    }
	});

	$(document).on( 'cycle-destroyed', function( e, opts) {
	    if ( opts._onHashChange ) {
	        $( window ).off( 'hashchange', opts._onHashChange );
	    }
	});

	function onHashChange( opts, setStartingSlide ) {
	    var hash;
	    if ( opts._hashFence ) {
	        opts._hashFence = false;
	        return;
	    }
	    
	    hash = window.location.hash.substring(1);

	    opts.slides.each(function(i) {
	        if ( $(this).data( 'cycle-hash' ) == hash ) {
	            if ( setStartingSlide === true ) {
	                opts.startingSlide = i;
	            }
	            else {
	                var fwd = opts.currSlide < i;
	                opts.nextSlide = i;
	                opts.API.prepareTx( true, fwd );
	            }
	            return false;
	        }
	    });
	}

	$.extend($.fn.cycle.defaults, {
	    loader: false
	});

	$(document).on( 'cycle-bootstrap', function( e, opts ) {
	    var addFn;

	    if ( !opts.loader )
	        return;

	    // override API.add for this slideshow
	    addFn = opts.API.add;
	    opts.API.add = add;

	    function add( slides, prepend ) {
	        var slideArr = [];
	        if ( $.type( slides ) == 'string' )
	            slides = $.trim( slides );
	        else if ( $.type( slides) === 'array' ) {
	            for (var i=0; i < slides.length; i++ )
	                slides[i] = $(slides[i])[0];
	        }

	        slides = $( slides );
	        var slideCount = slides.length;

	        if ( ! slideCount )
	            return;

	        slides.css('visibility','hidden').appendTo('body').each(function(i) { // appendTo fixes #56
	            var count = 0;
	            var slide = $(this);
	            var images = slide.is('img') ? slide : slide.find('img');
	            slide.data('index', i);
	            // allow some images to be marked as unimportant (and filter out images w/o src value)
	            images = images.filter(':not(.cycle-loader-ignore)').filter(':not([src=""])');
	            if ( ! images.length ) {
	                --slideCount;
	                slideArr.push( slide );
	                return;
	            }

	            count = images.length;
	            images.each(function() {
	                // add images that are already loaded
	                if ( this.complete ) {
	                    imageLoaded();
	                }
	                else {
	                    $(this).load(function() {
	                        imageLoaded();
	                    }).on("error", function() {
	                        if ( --count === 0 ) {
	                            // ignore this slide
	                            opts.API.log('slide skipped; img not loaded:', this.src);
	                            if ( --slideCount === 0 && opts.loader == 'wait') {
	                                addFn.apply( opts.API, [ slideArr, prepend ] );
	                            }
	                        }
	                    });
	                }
	            });

	            function imageLoaded() {
	                if ( --count === 0 ) {
	                    --slideCount;
	                    addSlide( slide );
	                }
	            }
	        });

	        if ( slideCount )
	            opts.container.addClass('cycle-loading');
	        

	        function addSlide( slide ) {
	            var curr;
	            if ( opts.loader == 'wait' ) {
	                slideArr.push( slide );
	                if ( slideCount === 0 ) {
	                    // #59; sort slides into original markup order
	                    slideArr.sort( sorter );
	                    addFn.apply( opts.API, [ slideArr, prepend ] );
	                    opts.container.removeClass('cycle-loading');
	                }
	            }
	            else {
	                curr = $(opts.slides[opts.currSlide]);
	                addFn.apply( opts.API, [ slide, prepend ] );
	                curr.show();
	                opts.container.removeClass('cycle-loading');
	            }
	        }

	        function sorter(a, b) {
	            return a.data('index') - b.data('index');
	        }
	    }
	});

	$.extend($.fn.cycle.defaults, {
	    pager:            '> .cycle-pager',
	    pagerActiveClass: 'cycle-pager-active',
	    pagerEvent:       'click.cycle',
	    pagerEventBubble: undefined,
	    pagerTemplate:    '<span>&bull;</span>'
	});

	$(document).on( 'cycle-bootstrap', function( e, opts, API ) {
	    // add method to API
	    API.buildPagerLink = buildPagerLink;
	});

	$(document).on( 'cycle-slide-added', function( e, opts, slideOpts, slideAdded ) {
	    if ( opts.pager ) {
	        opts.API.buildPagerLink ( opts, slideOpts, slideAdded );
	        opts.API.page = page;
	    }
	});

	$(document).on( 'cycle-slide-removed', function( e, opts, index, slideRemoved ) {
	    if ( opts.pager ) {
	        var pagers = opts.API.getComponent( 'pager' );
	        pagers.each(function() {
	            var pager = $(this);
	            $( pager.children()[index] ).remove();
	        });
	    }
	});

	$(document).on( 'cycle-update-view', function( e, opts, slideOpts ) {
	    var pagers;

	    if ( opts.pager ) {
	        pagers = opts.API.getComponent( 'pager' );
	        pagers.each(function() {
	           $(this).children().removeClass( opts.pagerActiveClass )
	            .eq( opts.currSlide ).addClass( opts.pagerActiveClass );
	        });
	    }
	});

	$(document).on( 'cycle-destroyed', function( e, opts ) {
	    var pager = opts.API.getComponent( 'pager' );

	    if ( pager ) {
	        pager.children().off( opts.pagerEvent ); // #202
	        if ( opts.pagerTemplate )
	            pager.empty();
	    }
	});

	function buildPagerLink( opts, slideOpts, slide ) {
	    var pagerLink;
	    var pagers = opts.API.getComponent( 'pager' );
	    pagers.each(function() {
	        var pager = $(this);
	        if ( slideOpts.pagerTemplate ) {
	            var markup = opts.API.tmpl( slideOpts.pagerTemplate, slideOpts, opts, slide[0] );
	            pagerLink = $( markup ).appendTo( pager );
	        }
	        else {
	            pagerLink = pager.children().eq( opts.slideCount - 1 );
	        }
	        pagerLink.on( opts.pagerEvent, function(e) {
	            if ( ! opts.pagerEventBubble )
	                e.preventDefault();
	            opts.API.page( pager, e.currentTarget);
	        });
	    });
	}

	function page( pager, target ) {
	    /*jshint validthis:true */
	    var opts = this.opts();
	    if ( opts.busy && ! opts.manualTrump )
	        return;

	    var index = pager.children().index( target );
	    var nextSlide = index;
	    var fwd = opts.currSlide < nextSlide;
	    if (opts.currSlide == nextSlide) {
	        return; // no op, clicked pager for the currently displayed slide
	    }
	    opts.nextSlide = nextSlide;
	    opts._tempFx = opts.pagerFx;
	    opts.API.prepareTx( true, fwd );
	    opts.API.trigger('cycle-pager-activated', [opts, pager, target ]);
	}

	$.extend($.fn.cycle.defaults, {
	    next:           '> .cycle-next',
	    nextEvent:      'click.cycle',
	    disabledClass:  'disabled',
	    prev:           '> .cycle-prev',
	    prevEvent:      'click.cycle',
	    swipe:          false
	});

	$(document).on( 'cycle-initialized', function( e, opts ) {
	    opts.API.getComponent( 'next' ).on( opts.nextEvent, function(e) {
	        e.preventDefault();
	        opts.API.next();
	    });

	    opts.API.getComponent( 'prev' ).on( opts.prevEvent, function(e) {
	        e.preventDefault();
	        opts.API.prev();
	    });

	    if ( opts.swipe ) {
	        var nextEvent = opts.swipeVert ? 'swipeUp.cycle' : 'swipeLeft.cycle swipeleft.cycle';
	        var prevEvent = opts.swipeVert ? 'swipeDown.cycle' : 'swipeRight.cycle swiperight.cycle';
	        opts.container.on( nextEvent, function(e) {
	            opts._tempFx = opts.swipeFx;
	            opts.API.next();
	        });
	        opts.container.on( prevEvent, function() {
	            opts._tempFx = opts.swipeFx;
	            opts.API.prev();
	        });
	    }
	});

	$(document).on( 'cycle-update-view', function( e, opts, slideOpts, currSlide ) {
	    if ( opts.allowWrap )
	        return;

	    var cls = opts.disabledClass;
	    var next = opts.API.getComponent( 'next' );
	    var prev = opts.API.getComponent( 'prev' );
	    var prevBoundry = opts._prevBoundry || 0;
	    var nextBoundry = (opts._nextBoundry !== undefined)?opts._nextBoundry:opts.slideCount - 1;

	    if ( opts.currSlide == nextBoundry )
	        next.addClass( cls ).prop( 'disabled', true );
	    else
	        next.removeClass( cls ).prop( 'disabled', false );

	    if ( opts.currSlide === prevBoundry )
	        prev.addClass( cls ).prop( 'disabled', true );
	    else
	        prev.removeClass( cls ).prop( 'disabled', false );
	});


	$(document).on( 'cycle-destroyed', function( e, opts ) {
	    opts.API.getComponent( 'prev' ).off( opts.nextEvent );
	    opts.API.getComponent( 'next' ).off( opts.prevEvent );
	    opts.container.off( 'swipeleft.cycle swiperight.cycle swipeLeft.cycle swipeRight.cycle swipeUp.cycle swipeDown.cycle' );
	});

	$.extend($.fn.cycle.defaults, {
	    progressive: false
	});

	$(document).on( 'cycle-pre-initialize', function( e, opts ) {
	    if ( !opts.progressive )
	        return;

	    var API = opts.API;
	    var nextFn = API.next;
	    var prevFn = API.prev;
	    var prepareTxFn = API.prepareTx;
	    var type = $.type( opts.progressive );
	    var slides, scriptEl;

	    if ( type == 'array' ) {
	        slides = opts.progressive;
	    }
	    else if ($.isFunction( opts.progressive ) ) {
	        slides = opts.progressive( opts );
	    }
	    else if ( type == 'string' ) {
	        scriptEl = $( opts.progressive );
	        slides = $.trim( scriptEl.html() );
	        if ( !slides )
	            return;
	        // is it json array?
	        if ( /^(\[)/.test( slides ) ) {
	            try {
	                slides = $.parseJSON( slides );
	            }
	            catch(err) {
	                API.log( 'error parsing progressive slides', err );
	                return;
	            }
	        }
	        else {
	            // plain text, split on delimeter
	            slides = slides.split( new RegExp( scriptEl.data('cycle-split') || '\n') );
	            
	            // #95; look for empty slide
	            if ( ! slides[ slides.length - 1 ] )
	                slides.pop();
	        }
	    }



	    if ( prepareTxFn ) {
	        API.prepareTx = function( manual, fwd ) {
	            var index, slide;

	            if ( manual || slides.length === 0 ) {
	                prepareTxFn.apply( opts.API, [ manual, fwd ] );
	                return;
	            }

	            if ( fwd && opts.currSlide == ( opts.slideCount-1) ) {
	                slide = slides[ 0 ];
	                slides = slides.slice( 1 );
	                opts.container.one('cycle-slide-added', function(e, opts ) {
	                    setTimeout(function() {
	                        opts.API.advanceSlide( 1 );
	                    },50);
	                });
	                opts.API.add( slide );
	            }
	            else if ( !fwd && opts.currSlide === 0 ) {
	                index = slides.length-1;
	                slide = slides[ index ];
	                slides = slides.slice( 0, index );
	                opts.container.one('cycle-slide-added', function(e, opts ) {
	                    setTimeout(function() {
	                        opts.currSlide = 1;
	                        opts.API.advanceSlide( -1 );
	                    },50);
	                });
	                opts.API.add( slide, true );
	            }
	            else {
	                prepareTxFn.apply( opts.API, [ manual, fwd ] );
	            }
	        };
	    }

	    if ( nextFn ) {
	        API.next = function() {
	            var opts = this.opts();
	            if ( slides.length && opts.currSlide == ( opts.slideCount - 1 ) ) {
	                var slide = slides[ 0 ];
	                slides = slides.slice( 1 );
	                opts.container.one('cycle-slide-added', function(e, opts ) {
	                    nextFn.apply( opts.API );
	                    opts.container.removeClass('cycle-loading');
	                });
	                opts.container.addClass('cycle-loading');
	                opts.API.add( slide );
	            }
	            else {
	                nextFn.apply( opts.API );    
	            }
	        };
	    }
	    
	    if ( prevFn ) {
	        API.prev = function() {
	            var opts = this.opts();
	            if ( slides.length && opts.currSlide === 0 ) {
	                var index = slides.length-1;
	                var slide = slides[ index ];
	                slides = slides.slice( 0, index );
	                opts.container.one('cycle-slide-added', function(e, opts ) {
	                    opts.currSlide = 1;
	                    opts.API.advanceSlide( -1 );
	                    opts.container.removeClass('cycle-loading');
	                });
	                opts.container.addClass('cycle-loading');
	                opts.API.add( slide, true );
	            }
	            else {
	                prevFn.apply( opts.API );
	            }
	        };
	    }
	});

	$.extend($.fn.cycle.defaults, {
	    tmplRegex: '{{((.)?.*?)}}'
	});

	$.extend($.fn.cycle.API, {
	    tmpl: function( str, opts /*, ... */) {
	        var regex = new RegExp( opts.tmplRegex || $.fn.cycle.defaults.tmplRegex, 'g' );
	        var args = $.makeArray( arguments );
	        args.shift();
	        return str.replace(regex, function(_, str) {
	            var i, j, obj, prop, names = str.split('.');
	            for (i=0; i < args.length; i++) {
	                obj = args[i];
	                if ( ! obj )
	                    continue;
	                if (names.length > 1) {
	                    prop = obj;
	                    for (j=0; j < names.length; j++) {
	                        obj = prop;
	                        prop = prop[ names[j] ] || str;
	                    }
	                } else {
	                    prop = obj[str];
	                }

	                if ($.isFunction(prop))
	                    return prop.apply(obj, args);
	                if (prop !== undefined && prop !== null && prop != str)
	                    return prop;
	            }
	            return str;
	        });
	    }
	});
}));
/*!
 * Masonry PACKAGED v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
      return factory( window, jQuery );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('jquery')
    );
  } else {
    // browser global
    window.jQueryBridget = factory(
      window,
      window.jQuery
    );
  }

}( window, function factory( window, jQuery ) {
'use strict';

// ----- utils ----- //

var arraySlice = Array.prototype.slice;

// helper function for logging errors
// $.error breaks jQuery chaining
var console = window.console;
var logError = typeof console == 'undefined' ? function() {} :
  function( message ) {
    console.error( message );
  };

// ----- jQueryBridget ----- //

function jQueryBridget( namespace, PluginClass, $ ) {
  $ = $ || jQuery || window.jQuery;
  if ( !$ ) {
    return;
  }

  // add option method -> $().plugin('option', {...})
  if ( !PluginClass.prototype.option ) {
    // option setter
    PluginClass.prototype.option = function( opts ) {
      // bail out if not an object
      if ( !$.isPlainObject( opts ) ){
        return;
      }
      this.options = $.extend( true, this.options, opts );
    };
  }

  // make jQuery plugin
  $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
    if ( typeof arg0 == 'string' ) {
      // method call $().plugin( 'methodName', { options } )
      // shift arguments by 1
      var args = arraySlice.call( arguments, 1 );
      return methodCall( this, arg0, args );
    }
    // just $().plugin({ options })
    plainCall( this, arg0 );
    return this;
  };

  // $().plugin('methodName')
  function methodCall( $elems, methodName, args ) {
    var returnValue;
    var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

    $elems.each( function( i, elem ) {
      // get instance
      var instance = $.data( elem, namespace );
      if ( !instance ) {
        logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
          pluginMethodStr );
        return;
      }

      var method = instance[ methodName ];
      if ( !method || methodName.charAt(0) == '_' ) {
        logError( pluginMethodStr + ' is not a valid method' );
        return;
      }

      // apply method, get return value
      var value = method.apply( instance, args );
      // set return value if value is returned, use only first value
      returnValue = returnValue === undefined ? value : returnValue;
    });

    return returnValue !== undefined ? returnValue : $elems;
  }

  function plainCall( $elems, options ) {
    $elems.each( function( i, elem ) {
      var instance = $.data( elem, namespace );
      if ( instance ) {
        // set options & init
        instance.option( options );
        instance._init();
      } else {
        // initialize new instance
        instance = new PluginClass( elem, options );
        $.data( elem, namespace, instance );
      }
    });
  }

  updateJQuery( $ );

}

// ----- updateJQuery ----- //

// set $.bridget for v1 backwards compatibility
function updateJQuery( $ ) {
  if ( !$ || ( $ && $.bridget ) ) {
    return;
  }
  $.bridget = jQueryBridget;
}

updateJQuery( jQuery || window.jQuery );

// -----  ----- //

return jQueryBridget;

}));

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'ev-emitter/ev-emitter',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {



function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice(0);
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( var i=0; i < listeners.length; i++ ) {
    var listener = listeners[i]
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
};

return EvEmitter;

}));

/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */
/* globals console: false */

( function( window, factory ) {
  /* jshint strict: false */ /* globals define, module */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'get-size/get-size',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

var measurementsLength = measurements.length;

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function getStyle( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See https://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

var isSetup = false;

var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * Chrome & Safari measure the outer-width on style.width on border-box elems
   * IE11 & Firefox<29 measures the inner-width
   */
  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style.boxSizing = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );
  // round value for browser zoom. desandro/masonry#928
  isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
  getSize.isBoxSizeOuter = isBoxSizeOuter;

  body.removeChild( div );
}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // get all measurements
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

return getSize;

});

/**
 * matchesSelector v2.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  /*global define: false, module: false */
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'desandro-matches-selector/matches-selector',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.matchesSelector = factory();
  }

}( window, function factory() {
  'use strict';

  var matchesMethod = ( function() {
    var ElemProto = window.Element.prototype;
    // check for the standard method name first
    if ( ElemProto.matches ) {
      return 'matches';
    }
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0; i < prefixes.length; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  return function matchesSelector( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  };

}));

/**
 * Fizzy UI utils v2.0.7
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /*globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'fizzy-ui-utils/utils',[
      'desandro-matches-selector/matches-selector'
    ], function( matchesSelector ) {
      return factory( window, matchesSelector );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('desandro-matches-selector')
    );
  } else {
    // browser global
    window.fizzyUIUtils = factory(
      window,
      window.matchesSelector
    );
  }

}( window, function factory( window, matchesSelector ) {



var utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- makeArray ----- //

var arraySlice = Array.prototype.slice;

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    return obj;
  }
  // return empty array if undefined or null. #6
  if ( obj === null || obj === undefined ) {
    return [];
  }

  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  if ( isArrayLike ) {
    // convert nodeList to array
    return arraySlice.call( obj );
  }

  // array of single index
  return [ obj ];
};

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  var index = ary.indexOf( obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem.parentNode && elem != document.body ) {
    elem = elem.parentNode;
    if ( matchesSelector( elem, selector ) ) {
      return elem;
    }
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );
  var ffElems = [];

  elems.forEach( function( elem ) {
    // check that elem is an actual element
    if ( !( elem instanceof HTMLElement ) ) {
      return;
    }
    // add elem if no selector
    if ( !selector ) {
      ffElems.push( elem );
      return;
    }
    // filter & find items if we have a selector
    // filter
    if ( matchesSelector( elem, selector ) ) {
      ffElems.push( elem );
    }
    // find children
    var childElems = elem.querySelectorAll( selector );
    // concat childElems to filterFound array
    for ( var i=0; i < childElems.length; i++ ) {
      ffElems.push( childElems[i] );
    }
  });

  return ffElems;
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  threshold = threshold || 100;
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    clearTimeout( timeout );

    var args = arguments;
    var _this = this;
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args );
      delete _this[ timeoutName ];
    }, threshold );
  };
};

// ----- docReady ----- //

utils.docReady = function( callback ) {
  var readyState = document.readyState;
  if ( readyState == 'complete' || readyState == 'interactive' ) {
    // do async to allow for other scripts to run. metafizzy/flickity#441
    setTimeout( callback );
  } else {
    document.addEventListener( 'DOMContentLoaded', callback );
  }
};

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

var console = window.console;
/**
 * allow user to initialize classes via [data-namespace] or .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-options
 */
utils.htmlInit = function( WidgetClass, namespace ) {
  utils.docReady( function() {
    var dashedNamespace = utils.toDashed( namespace );
    var dataAttr = 'data-' + dashedNamespace;
    var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
    var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
    var elems = utils.makeArray( dataAttrElems )
      .concat( utils.makeArray( jsDashElems ) );
    var dataOptionsAttr = dataAttr + '-options';
    var jQuery = window.jQuery;

    elems.forEach( function( elem ) {
      var attr = elem.getAttribute( dataAttr ) ||
        elem.getAttribute( dataOptionsAttr );
      var options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
          ': ' + error );
        }
        return;
      }
      // initialize
      var instance = new WidgetClass( elem, options );
      // make available via $().data('namespace')
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    });

  });
};

// -----  ----- //

return utils;

}));

/**
 * Outlayer Item
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/item',[
        'ev-emitter/ev-emitter',
        'get-size/get-size'
      ],
      factory
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('ev-emitter'),
      require('get-size')
    );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window.EvEmitter,
      window.getSize
    );
  }

}( window, function factory( EvEmitter, getSize ) {
'use strict';

// ----- helpers ----- //

function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// -------------------------- CSS3 support -------------------------- //


var docElemStyle = document.documentElement.style;

var transitionProperty = typeof docElemStyle.transition == 'string' ?
  'transition' : 'WebkitTransition';
var transformProperty = typeof docElemStyle.transform == 'string' ?
  'transform' : 'WebkitTransform';

var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  transition: 'transitionend'
}[ transitionProperty ];

// cache all vendor properties that could have vendor prefix
var vendorProperties = {
  transform: transformProperty,
  transition: transitionProperty,
  transitionDuration: transitionProperty + 'Duration',
  transitionProperty: transitionProperty + 'Property',
  transitionDelay: transitionProperty + 'Delay'
};

// -------------------------- Item -------------------------- //

function Item( element, layout ) {
  if ( !element ) {
    return;
  }

  this.element = element;
  // parent layout class, i.e. Masonry, Isotope, or Packery
  this.layout = layout;
  this.position = {
    x: 0,
    y: 0
  };

  this._create();
}

// inherit EvEmitter
var proto = Item.prototype = Object.create( EvEmitter.prototype );
proto.constructor = Item;

proto._create = function() {
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };

  this.css({
    position: 'absolute'
  });
};

// trigger specified handler for event type
proto.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * apply CSS styles to element
 * @param {Object} style
 */
proto.css = function( style ) {
  var elemStyle = this.element.style;

  for ( var prop in style ) {
    // use vendor property if available
    var supportedProp = vendorProperties[ prop ] || prop;
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

 // measure position, and sets it
proto.getPosition = function() {
  var style = getComputedStyle( this.element );
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  var xValue = style[ isOriginLeft ? 'left' : 'right' ];
  var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
  var x = parseFloat( xValue );
  var y = parseFloat( yValue );
  // convert percent to pixels
  var layoutSize = this.layout.size;
  if ( xValue.indexOf('%') != -1 ) {
    x = ( x / 100 ) * layoutSize.width;
  }
  if ( yValue.indexOf('%') != -1 ) {
    y = ( y / 100 ) * layoutSize.height;
  }
  // clean up 'auto' or other non-integer values
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // remove padding from measurement
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  this.position.x = x;
  this.position.y = y;
};

// set settled position, apply padding
proto.layoutPosition = function() {
  var layoutSize = this.layout.size;
  var style = {};
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');

  // x
  var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
  var xProperty = isOriginLeft ? 'left' : 'right';
  var xResetProperty = isOriginLeft ? 'right' : 'left';

  var x = this.position.x + layoutSize[ xPadding ];
  // set in percentage or pixels
  style[ xProperty ] = this.getXValue( x );
  // reset other property
  style[ xResetProperty ] = '';

  // y
  var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
  var yProperty = isOriginTop ? 'top' : 'bottom';
  var yResetProperty = isOriginTop ? 'bottom' : 'top';

  var y = this.position.y + layoutSize[ yPadding ];
  // set in percentage or pixels
  style[ yProperty ] = this.getYValue( y );
  // reset other property
  style[ yResetProperty ] = '';

  this.css( style );
  this.emitEvent( 'layout', [ this ] );
};

proto.getXValue = function( x ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && !isHorizontal ?
    ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
};

proto.getYValue = function( y ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && isHorizontal ?
    ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
};

proto._transitionTo = function( x, y ) {
  this.getPosition();
  // get current x & y from top/left
  var curX = this.position.x;
  var curY = this.position.y;

  var didNotMove = x == this.position.x && y == this.position.y;

  // save end position
  this.setPosition( x, y );

  // if did not move and not transitioning, just go to layout
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  transitionStyle.transform = this.getTranslate( transX, transY );

  this.transition({
    to: transitionStyle,
    onTransitionEnd: {
      transform: this.layoutPosition
    },
    isCleaning: true
  });
};

proto.getTranslate = function( x, y ) {
  // flip cooridinates if origin on right or bottom
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  x = isOriginLeft ? x : -x;
  y = isOriginTop ? y : -y;
  return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
};

// non transition + transform support
proto.goTo = function( x, y ) {
  this.setPosition( x, y );
  this.layoutPosition();
};

proto.moveTo = proto._transitionTo;

proto.setPosition = function( x, y ) {
  this.position.x = parseFloat( x );
  this.position.y = parseFloat( y );
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// non transition, just trigger callback
proto._nonTransition = function( args ) {
  this.css( args.to );
  if ( args.isCleaning ) {
    this._removeStyles( args.to );
  }
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
proto.transition = function( args ) {
  // redirect to nonTransition if no transition duration
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn;
  // keep track of onTransitionEnd callback by css property
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // keep track of properties that are transitioning
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true;
    // keep track of properties to clean up when transition is done
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true;
    }
  }

  // set from styles
  if ( args.from ) {
    this.css( args.from );
    // force redraw. http://blog.alexmaccaw.com/css-transitions
    var h = this.element.offsetHeight;
    // hack for JSHint to hush about unused var
    h = null;
  }
  // enable transition
  this.enableTransition( args.to );
  // set styles that are transitioning
  this.css( args.to );

  this.isTransitioning = true;

};

// dash before all cap letters, including first for
// WebkitTransform => -webkit-transform
function toDashedAll( str ) {
  return str.replace( /([A-Z])/g, function( $1 ) {
    return '-' + $1.toLowerCase();
  });
}

var transitionProps = 'opacity,' + toDashedAll( transformProperty );

proto.enableTransition = function(/* style */) {
  // HACK changing transitionProperty during a transition
  // will cause transition to jump
  if ( this.isTransitioning ) {
    return;
  }

  // make `transition: foo, bar, baz` from style object
  // HACK un-comment this when enableTransition can work
  // while a transition is happening
  // var transitionValues = [];
  // for ( var prop in style ) {
  //   // dash-ify camelCased properties like WebkitTransition
  //   prop = vendorProperties[ prop ] || prop;
  //   transitionValues.push( toDashedAll( prop ) );
  // }
  // munge number to millisecond, to match stagger
  var duration = this.layout.options.transitionDuration;
  duration = typeof duration == 'number' ? duration + 'ms' : duration;
  // enable transition styles
  this.css({
    transitionProperty: transitionProps,
    transitionDuration: duration,
    transitionDelay: this.staggerDelay || 0
  });
  // listen for transition end event
  this.element.addEventListener( transitionEndEvent, this, false );
};

// ----- events ----- //

proto.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event );
};

proto.onotransitionend = function( event ) {
  this.ontransitionend( event );
};

// properties that I munge to make my life easier
var dashedVendorProperties = {
  '-webkit-transform': 'transform'
};

proto.ontransitionend = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn;
  // get property name of transitioned property, convert to prefix-free
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // remove property that has completed transitioning
  delete _transition.ingProperties[ propertyName ];
  // check if any properties are still transitioning
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // all properties have completed transitioning
    this.disableTransition();
  }
  // clean style
  if ( propertyName in _transition.clean ) {
    // clean up style
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // trigger onTransitionEnd callback
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  this.emitEvent( 'transitionEnd', [ this ] );
};

proto.disableTransition = function() {
  this.removeTransitionStyles();
  this.element.removeEventListener( transitionEndEvent, this, false );
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
proto._removeStyles = function( style ) {
  // clean up transition styles
  var cleanStyle = {};
  for ( var prop in style ) {
    cleanStyle[ prop ] = '';
  }
  this.css( cleanStyle );
};

var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: '',
  transitionDelay: ''
};

proto.removeTransitionStyles = function() {
  // remove transition
  this.css( cleanTransitionStyle );
};

// ----- stagger ----- //

proto.stagger = function( delay ) {
  delay = isNaN( delay ) ? 0 : delay;
  this.staggerDelay = delay + 'ms';
};

// ----- show/hide/remove ----- //

// remove element from DOM
proto.removeElem = function() {
  this.element.parentNode.removeChild( this.element );
  // remove display: none
  this.css({ display: '' });
  this.emitEvent( 'remove', [ this ] );
};

proto.remove = function() {
  // just remove element if no transition support or no transition
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // start transition
  this.once( 'transitionEnd', function() {
    this.removeElem();
  });
  this.hide();
};

proto.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onRevealTransitionEnd = function() {
  // check if still visible
  // during transition, item may have been hidden
  if ( !this.isHidden ) {
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ];
  // use opacity
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // get first property
  for ( var prop in optionStyle ) {
    return prop;
  }
};

proto.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onHideTransitionEnd = function() {
  // check if still hidden
  // during transition, item may have been un-hidden
  if ( this.isHidden ) {
    this.css({ display: 'none' });
    this.emitEvent('hide');
  }
};

proto.destroy = function() {
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

return Item;

}));

/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/outlayer',[
        'ev-emitter/ev-emitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( EvEmitter, getSize, utils, Item ) {
        return factory( window, EvEmitter, getSize, utils, Item);
      }
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      window,
      require('ev-emitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // browser global
    window.Outlayer = factory(
      window,
      window.EvEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, EvEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};


/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
function Outlayer( element, options ) {
  var queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  this.element = queryElement;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // add id for Outlayer.getFromElement
  var id = ++GUID;
  this.element.outlayerGUID = id; // expando
  instances[ id ] = this; // associate via id

  // kick it off
  this._create();

  var isInitLayout = this._getOption('initLayout');
  if ( isInitLayout ) {
    this.layout();
  }
}

// settings are for internal use only
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// default options
Outlayer.defaults = {
  containerStyle: {
    position: 'relative'
  },
  initLayout: true,
  originLeft: true,
  originTop: true,
  resize: true,
  resizeContainer: true,
  // item options
  transitionDuration: '0.4s',
  hiddenStyle: {
    opacity: 0,
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1,
    transform: 'scale(1)'
  }
};

var proto = Outlayer.prototype;
// inherit EvEmitter
utils.extend( proto, EvEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

/**
 * get backwards compatible option value, check old name
 */
proto._getOption = function( option ) {
  var oldOption = this.constructor.compatOptions[ option ];
  return oldOption && this.options[ oldOption ] !== undefined ?
    this.options[ oldOption ] : this.options[ option ];
};

Outlayer.compatOptions = {
  // currentName: oldName
  initLayout: 'isInitLayout',
  horizontal: 'isHorizontal',
  layoutInstant: 'isLayoutInstant',
  originLeft: 'isOriginLeft',
  originTop: 'isOriginTop',
  resize: 'isResizeBound',
  resizeContainer: 'isResizingContainer'
};

proto._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  utils.extend( this.element.style, this.options.containerStyle );

  // bind resize method
  var canBindResize = this._getOption('resize');
  if ( canBindResize ) {
    this.bindResize();
  }
};

// goes through all children again and gets bricks in proper order
proto.reloadItems = function() {
  // collection of item elements
  this.items = this._itemize( this.element.children );
};


/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
proto._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
proto._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
proto.getItemElements = function() {
  return this.items.map( function( item ) {
    return item.element;
  });
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
proto.layout = function() {
  this._resetLayout();
  this._manageStamps();

  // don't animate first layout
  var layoutInstant = this._getOption('layoutInstant');
  var isInstant = layoutInstant !== undefined ?
    layoutInstant : !this._isLayoutInited;
  this.layoutItems( this.items, isInstant );

  // flag for initalized
  this._isLayoutInited = true;
};

// _init is alias for layout
proto._init = proto.layout;

/**
 * logic before any new layout
 */
proto._resetLayout = function() {
  this.getSize();
};


proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
proto._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // default to 0
    this[ measurement ] = 0;
  } else {
    // use option as an element
    if ( typeof option == 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( option instanceof HTMLElement ) {
      elem = option;
    }
    // use size of element, if element
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
proto.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this._layoutItems( items, isInstant );

  this._postLayout();
};

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
proto._getItemsForLayout = function( items ) {
  return items.filter( function( item ) {
    return !item.isIgnored;
  });
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
proto._layoutItems = function( items, isInstant ) {
  this._emitCompleteOnItems( 'layout', items );

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    return;
  }

  var queue = [];

  items.forEach( function( item ) {
    // get x/y object from method
    var position = this._getItemLayoutPosition( item );
    // enqueue
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }, this );

  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
proto._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
proto._processLayoutQueue = function( queue ) {
  this.updateStagger();
  queue.forEach( function( obj, i ) {
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
  }, this );
};

// set stagger from option in milliseconds number
proto.updateStagger = function() {
  var stagger = this.options.stagger;
  if ( stagger === null || stagger === undefined ) {
    this.stagger = 0;
    return;
  }
  this.stagger = getMilliseconds( stagger );
  return this.stagger;
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
proto._positionItem = function( item, x, y, isInstant, i ) {
  if ( isInstant ) {
    // if not transition, just set CSS
    item.goTo( x, y );
  } else {
    item.stagger( i * this.stagger );
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
proto._postLayout = function() {
  this.resizeContainer();
};

proto.resizeContainer = function() {
  var isResizingContainer = this._getOption('resizeContainer');
  if ( !isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize();
  if ( size ) {
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
proto._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
proto._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size;
  // add padding and border width if border box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  measure = Math.max( measure, 0 );
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
proto._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
  }

  var count = items.length;
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    if ( doneCount == count ) {
      onComplete();
    }
  }

  // bind callback
  items.forEach( function( item ) {
    item.once( eventName, tick );
  });
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  // add original event to arguments
  var emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );

  if ( jQuery ) {
    // set this.$element
    this.$element = this.$element || jQuery( this.element );
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- ignore & stamps -------------------------- //


/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
proto.ignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    item.isIgnored = true;
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
proto.unignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    delete item.isIgnored;
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
proto.stamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ) {
    return;
  }

  this.stamps = this.stamps.concat( elems );
  // ignore
  elems.forEach( this.ignore, this );
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
proto.unstamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ){
    return;
  }

  elems.forEach( function( elem ) {
    // filter out removed stamp elements
    utils.removeFrom( this.stamps, elem );
    this.unignore( elem );
  }, this );
};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
proto._find = function( elems ) {
  if ( !elems ) {
    return;
  }
  // if string, use argument as selector string
  if ( typeof elems == 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  elems = utils.makeArray( elems );
  return elems;
};

proto._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return;
  }

  this._getBoundingRect();

  this.stamps.forEach( this._manageStamp, this );
};

// update boundingLeft / Top
proto._getBoundingRect = function() {
  // get bounding rect for container element
  var boundingRect = this.element.getBoundingClientRect();
  var size = this.size;
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
proto._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
proto._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect();
  var thisRect = this._boundingRect;
  var size = getSize( elem );
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
proto.handleEvent = utils.handleEvent;

/**
 * Bind layout to window resizing
 */
proto.bindResize = function() {
  window.addEventListener( 'resize', this );
  this.isResizeBound = true;
};

/**
 * Unbind layout to window resizing
 */
proto.unbindResize = function() {
  window.removeEventListener( 'resize', this );
  this.isResizeBound = false;
};

proto.onresize = function() {
  this.resize();
};

utils.debounceMethod( Outlayer, 'onresize', 100 );

proto.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  this.layout();
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
proto.needsResizeLayout = function() {
  var size = getSize( this.element );
  // check that this.size and size are there
  // IE8 triggers resize on body size change, so they might not be
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
proto.addItems = function( elems ) {
  var items = this._itemize( elems );
  // add items to collection
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
proto.appended = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) {
    return;
  }
  // layout and reveal just the new items
  this.layoutItems( items, true );
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
proto.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) {
    return;
  }
  // add items to beginning of collection
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // start new layout
  this._resetLayout();
  this._manageStamps();
  // layout new stuff without transition
  this.layoutItems( items, true );
  this.reveal( items );
  // layout previous items
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.reveal();
  });
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.hide();
  });
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.revealItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.reveal( items );
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.hideItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.hide( items );
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
proto.getItem = function( elem ) {
  // loop through items to get the one that matches
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( item.element == elem ) {
      // return item
      return item;
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
proto.getItems = function( elems ) {
  elems = utils.makeArray( elems );
  var items = [];
  elems.forEach( function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }, this );

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
proto.remove = function( elems ) {
  var removeItems = this.getItems( elems );

  this._emitCompleteOnItems( 'remove', removeItems );

  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  removeItems.forEach( function( item ) {
    item.remove();
    // remove item from collection
    utils.removeFrom( this.items, item );
  }, this );
};

// ----- destroy ----- //

// remove and disable Outlayer instance
proto.destroy = function() {
  // clean up dynamic styles
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // destroy items
  this.items.forEach( function( item ) {
    item.destroy();
  });

  this.unbindResize();

  var id = this.element.outlayerGUID;
  delete instances[ id ]; // remove reference to instance by id
  delete this.element.outlayerGUID;
  // remove data for jQuery
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }

};

// -------------------------- data -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.outlayerGUID;
  return id && instances[ id ];
};


// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // sub-class Outlayer
  var Layout = subclass( Outlayer );
  // apply new options and compatOptions
  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  utils.extend( Layout.defaults, options );
  Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

  Layout.namespace = namespace;

  Layout.data = Outlayer.data;

  // sub-class Item
  Layout.Item = subclass( Item );

  // -------------------------- declarative -------------------------- //

  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // make into jQuery plugin
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout );
  }

  return Layout;
};

function subclass( Parent ) {
  function SubClass() {
    Parent.apply( this, arguments );
  }

  SubClass.prototype = Object.create( Parent.prototype );
  SubClass.prototype.constructor = SubClass;

  return SubClass;
}

// ----- helpers ----- //

// how many milliseconds are in each unit
var msUnits = {
  ms: 1,
  s: 1000
};

// munge time-like parameter into millisecond number
// '0.4s' -> 40
function getMilliseconds( time ) {
  if ( typeof time == 'number' ) {
    return time;
  }
  var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
  var num = matches && matches[1];
  var unit = matches && matches[2];
  if ( !num.length ) {
    return 0;
  }
  num = parseFloat( num );
  var mult = msUnits[ unit ] || 1;
  return num * mult;
}

// ----- fin ----- //

// back in global
Outlayer.Item = Item;

return Outlayer;

}));

/*!
 * Masonry v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('outlayer'),
      require('get-size')
    );
  } else {
    // browser global
    window.Masonry = factory(
      window.Outlayer,
      window.getSize
    );
  }

}( window, function factory( Outlayer, getSize ) {



// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var Masonry = Outlayer.create('masonry');
  // isFitWidth -> fitWidth
  Masonry.compatOptions.fitWidth = 'isFitWidth';

  var proto = Masonry.prototype;

  proto._resetLayout = function() {
    this.getSize();
    this._getMeasurement( 'columnWidth', 'outerWidth' );
    this._getMeasurement( 'gutter', 'outerWidth' );
    this.measureColumns();

    // reset column Y
    this.colYs = [];
    for ( var i=0; i < this.cols; i++ ) {
      this.colYs.push( 0 );
    }

    this.maxY = 0;
    this.horizontalColIndex = 0;
  };

  proto.measureColumns = function() {
    this.getContainerWidth();
    // if columnWidth is 0, default to outerWidth of first item
    if ( !this.columnWidth ) {
      var firstItem = this.items[0];
      var firstItemElem = firstItem && firstItem.element;
      // columnWidth fall back to item of first element
      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
        // if first elem has no width, default to size of container
        this.containerWidth;
    }

    var columnWidth = this.columnWidth += this.gutter;

    // calculate columns
    var containerWidth = this.containerWidth + this.gutter;
    var cols = containerWidth / columnWidth;
    // fix rounding errors, typically with gutters
    var excess = columnWidth - containerWidth % columnWidth;
    // if overshoot is less than a pixel, round up, otherwise floor it
    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
    cols = Math[ mathMethod ]( cols );
    this.cols = Math.max( cols, 1 );
  };

  proto.getContainerWidth = function() {
    // container is parent if fit width
    var isFitWidth = this._getOption('fitWidth');
    var container = isFitWidth ? this.element.parentNode : this.element;
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var size = getSize( container );
    this.containerWidth = size && size.innerWidth;
  };

  proto._getItemLayoutPosition = function( item ) {
    item.getSize();
    // how many columns does this brick span
    var remainder = item.size.outerWidth % this.columnWidth;
    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
    // round if off by 1 pixel, otherwise use ceil
    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
    colSpan = Math.min( colSpan, this.cols );
    // use horizontal or top column position
    var colPosMethod = this.options.horizontalOrder ?
      '_getHorizontalColPosition' : '_getTopColPosition';
    var colPosition = this[ colPosMethod ]( colSpan, item );
    // position the brick
    var position = {
      x: this.columnWidth * colPosition.col,
      y: colPosition.y
    };
    // apply setHeight to necessary columns
    var setHeight = colPosition.y + item.size.outerHeight;
    var setMax = colSpan + colPosition.col;
    for ( var i = colPosition.col; i < setMax; i++ ) {
      this.colYs[i] = setHeight;
    }

    return position;
  };

  proto._getTopColPosition = function( colSpan ) {
    var colGroup = this._getTopColGroup( colSpan );
    // get the minimum Y value from the columns
    var minimumY = Math.min.apply( Math, colGroup );

    return {
      col: colGroup.indexOf( minimumY ),
      y: minimumY,
    };
  };

  /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
  proto._getTopColGroup = function( colSpan ) {
    if ( colSpan < 2 ) {
      // if brick spans only one column, use all the column Ys
      return this.colYs;
    }

    var colGroup = [];
    // how many different places could this brick fit horizontally
    var groupCount = this.cols + 1 - colSpan;
    // for each group potential horizontal position
    for ( var i = 0; i < groupCount; i++ ) {
      colGroup[i] = this._getColGroupY( i, colSpan );
    }
    return colGroup;
  };

  proto._getColGroupY = function( col, colSpan ) {
    if ( colSpan < 2 ) {
      return this.colYs[ col ];
    }
    // make an array of colY values for that one group
    var groupColYs = this.colYs.slice( col, col + colSpan );
    // and get the max value of the array
    return Math.max.apply( Math, groupColYs );
  };

  // get column position based on horizontal index. #873
  proto._getHorizontalColPosition = function( colSpan, item ) {
    var col = this.horizontalColIndex % this.cols;
    var isOver = colSpan > 1 && col + colSpan > this.cols;
    // shift to next row if item can't fit on current row
    col = isOver ? 0 : col;
    // don't let zero-size items take up space
    var hasSize = item.size.outerWidth && item.size.outerHeight;
    this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

    return {
      col: col,
      y: this._getColGroupY( col, colSpan ),
    };
  };

  proto._manageStamp = function( stamp ) {
    var stampSize = getSize( stamp );
    var offset = this._getElementOffset( stamp );
    // get the columns that this stamp affects
    var isOriginLeft = this._getOption('originLeft');
    var firstX = isOriginLeft ? offset.left : offset.right;
    var lastX = firstX + stampSize.outerWidth;
    var firstCol = Math.floor( firstX / this.columnWidth );
    firstCol = Math.max( 0, firstCol );
    var lastCol = Math.floor( lastX / this.columnWidth );
    // lastCol should not go over if multiple of columnWidth #425
    lastCol -= lastX % this.columnWidth ? 0 : 1;
    lastCol = Math.min( this.cols - 1, lastCol );
    // set colYs to bottom of the stamp

    var isOriginTop = this._getOption('originTop');
    var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
      stampSize.outerHeight;
    for ( var i = firstCol; i <= lastCol; i++ ) {
      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
    }
  };

  proto._getContainerSize = function() {
    this.maxY = Math.max.apply( Math, this.colYs );
    var size = {
      height: this.maxY
    };

    if ( this._getOption('fitWidth') ) {
      size.width = this._getContainerFitWidth();
    }

    return size;
  };

  proto._getContainerFitWidth = function() {
    var unusedCols = 0;
    // count unused columns
    var i = this.cols;
    while ( --i ) {
      if ( this.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    // fit container to columns that have been used
    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
  };

  proto.needsResizeLayout = function() {
    var previousWidth = this.containerWidth;
    this.getContainerWidth();
    return previousWidth != this.containerWidth;
  };

  return Masonry;

}));


(function($){

    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     * http://teamdf.com/jquery-plugins/license/
     *
     * @author Sam Sehnert
     * @desc A small plugin that checks whether elements are within
     *       the user visible viewport of a web browser.
     *       only accounts for vertical position, not horizontal.
     */
    $.fn.visible = function(partial,hidden,direction,container){

        if (this.length < 1)
            return;

        var $t          = this.length > 1 ? this.eq(0) : this,
						isContained = typeof container !== 'undefined' && container !== null,
						$w				  = isContained ? $(container) : $(window),
						wPosition        = isContained ? $w.position() : 0,
            t           = $t.get(0),
            vpWidth     = $w.outerWidth(),
            vpHeight    = $w.outerHeight(),
            direction   = (direction) ? direction : 'both',
            clientSize  = hidden === true ? t.offsetWidth * t.offsetHeight : true;

        if (typeof t.getBoundingClientRect === 'function'){

            // Use this native browser method, if available.
            var rec = t.getBoundingClientRect(),
                tViz = isContained ?
												rec.top - wPosition.top >= 0 && rec.top < vpHeight + wPosition.top :
												rec.top >= 0 && rec.top < vpHeight,
                bViz = isContained ?
												rec.bottom - wPosition.top > 0 && rec.bottom <= vpHeight + wPosition.top :
												rec.bottom > 0 && rec.bottom <= vpHeight,
                lViz = isContained ?
												rec.left - wPosition.left >= 0 && rec.left < vpWidth + wPosition.left :
												rec.left >= 0 && rec.left <  vpWidth,
                rViz = isContained ?
												rec.right - wPosition.left > 0  && rec.right < vpWidth + wPosition.left  :
												rec.right > 0 && rec.right <= vpWidth,
                vVisible   = partial ? tViz || bViz : tViz && bViz,
                hVisible   = partial ? lViz || rViz : lViz && rViz;

            if(direction === 'both')
                return clientSize && vVisible && hVisible;
            else if(direction === 'vertical')
                return clientSize && vVisible;
            else if(direction === 'horizontal')
                return clientSize && hVisible;
        } else {

            var viewTop 				= isContained ? 0 : wPosition,
                viewBottom      = viewTop + vpHeight,
                viewLeft        = $w.scrollLeft(),
                viewRight       = viewLeft + vpWidth,
                position          = $t.position(),
                _top            = position.top,
                _bottom         = _top + $t.height(),
                _left           = position.left,
                _right          = _left + $t.width(),
                compareTop      = partial === true ? _bottom : _top,
                compareBottom   = partial === true ? _top : _bottom,
                compareLeft     = partial === true ? _right : _left,
                compareRight    = partial === true ? _left : _right;

            if(direction === 'both')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            else if(direction === 'vertical')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            else if(direction === 'horizontal')
                return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
        }
    };

})(jQuery);

/*!
 * imagesLoaded v5.0.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( window, require('ev-emitter') );
  } else {
    // browser global
    window.imagesLoaded = factory( window, window.EvEmitter );
  }

} )( typeof window !== 'undefined' ? window : this,
    function factory( window, EvEmitter ) {

let $ = window.jQuery;
let console = window.console;

// -------------------------- helpers -------------------------- //

// turn element or nodeList into an array
function makeArray( obj ) {
  // use object if already an array
  if ( Array.isArray( obj ) ) return obj;

  let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  // convert nodeList to array
  if ( isArrayLike ) return [ ...obj ];

  // array of single index
  return [ obj ];
}

// -------------------------- imagesLoaded -------------------------- //

/**
 * @param {[Array, Element, NodeList, String]} elem
 * @param {[Object, Function]} options - if function, use as callback
 * @param {Function} onAlways - callback function
 * @returns {ImagesLoaded}
 */
function ImagesLoaded( elem, options, onAlways ) {
  // coerce ImagesLoaded() without new, to be new ImagesLoaded()
  if ( !( this instanceof ImagesLoaded ) ) {
    return new ImagesLoaded( elem, options, onAlways );
  }
  // use elem as selector string
  let queryElem = elem;
  if ( typeof elem == 'string' ) {
    queryElem = document.querySelectorAll( elem );
  }
  // bail if bad element
  if ( !queryElem ) {
    console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
    return;
  }

  this.elements = makeArray( queryElem );
  this.options = {};
  // shift arguments if no options set
  if ( typeof options == 'function' ) {
    onAlways = options;
  } else {
    Object.assign( this.options, options );
  }

  if ( onAlways ) this.on( 'always', onAlways );

  this.getImages();
  // add jQuery Deferred object
  if ( $ ) this.jqDeferred = new $.Deferred();

  // HACK check async to allow time to bind listeners
  setTimeout( this.check.bind( this ) );
}

ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

ImagesLoaded.prototype.getImages = function() {
  this.images = [];

  // filter & find items if we have an item selector
  this.elements.forEach( this.addElementImages, this );
};

const elementNodeTypes = [ 1, 9, 11 ];

/**
 * @param {Node} elem
 */
ImagesLoaded.prototype.addElementImages = function( elem ) {
  // filter siblings
  if ( elem.nodeName === 'IMG' ) {
    this.addImage( elem );
  }
  // get background image on element
  if ( this.options.background === true ) {
    this.addElementBackgroundImages( elem );
  }

  // find children
  // no non-element nodes, #143
  let { nodeType } = elem;
  if ( !nodeType || !elementNodeTypes.includes( nodeType ) ) return;

  let childImgs = elem.querySelectorAll('img');
  // concat childElems to filterFound array
  for ( let img of childImgs ) {
    this.addImage( img );
  }

  // get child background images
  if ( typeof this.options.background == 'string' ) {
    let children = elem.querySelectorAll( this.options.background );
    for ( let child of children ) {
      this.addElementBackgroundImages( child );
    }
  }
};

const reURL = /url\((['"])?(.*?)\1\)/gi;

ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
  let style = getComputedStyle( elem );
  // Firefox returns null if in a hidden iframe https://bugzil.la/548397
  if ( !style ) return;

  // get url inside url("...")
  let matches = reURL.exec( style.backgroundImage );
  while ( matches !== null ) {
    let url = matches && matches[2];
    if ( url ) {
      this.addBackground( url, elem );
    }
    matches = reURL.exec( style.backgroundImage );
  }
};

/**
 * @param {Image} img
 */
ImagesLoaded.prototype.addImage = function( img ) {
  let loadingImage = new LoadingImage( img );
  this.images.push( loadingImage );
};

ImagesLoaded.prototype.addBackground = function( url, elem ) {
  let background = new Background( url, elem );
  this.images.push( background );
};

ImagesLoaded.prototype.check = function() {
  this.progressedCount = 0;
  this.hasAnyBroken = false;
  // complete if no images
  if ( !this.images.length ) {
    this.complete();
    return;
  }

  /* eslint-disable-next-line func-style */
  let onProgress = ( image, elem, message ) => {
    // HACK - Chrome triggers event before object properties have changed. #83
    setTimeout( () => {
      this.progress( image, elem, message );
    } );
  };

  this.images.forEach( function( loadingImage ) {
    loadingImage.once( 'progress', onProgress );
    loadingImage.check();
  } );
};

ImagesLoaded.prototype.progress = function( image, elem, message ) {
  this.progressedCount++;
  this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
  // progress event
  this.emitEvent( 'progress', [ this, image, elem ] );
  if ( this.jqDeferred && this.jqDeferred.notify ) {
    this.jqDeferred.notify( this, image );
  }
  // check if completed
  if ( this.progressedCount === this.images.length ) {
    this.complete();
  }

  if ( this.options.debug && console ) {
    console.log( `progress: ${message}`, image, elem );
  }
};

ImagesLoaded.prototype.complete = function() {
  let eventName = this.hasAnyBroken ? 'fail' : 'done';
  this.isComplete = true;
  this.emitEvent( eventName, [ this ] );
  this.emitEvent( 'always', [ this ] );
  if ( this.jqDeferred ) {
    let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
    this.jqDeferred[ jqMethod ]( this );
  }
};

// --------------------------  -------------------------- //

function LoadingImage( img ) {
  this.img = img;
}

LoadingImage.prototype = Object.create( EvEmitter.prototype );

LoadingImage.prototype.check = function() {
  // If complete is true and browser supports natural sizes,
  // try to check for image status manually.
  let isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    // report based on naturalWidth
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    return;
  }

  // If none of the checks above matched, simulate loading on detached element.
  this.proxyImage = new Image();
  // add crossOrigin attribute. #204
  if ( this.img.crossOrigin ) {
    this.proxyImage.crossOrigin = this.img.crossOrigin;
  }
  this.proxyImage.addEventListener( 'load', this );
  this.proxyImage.addEventListener( 'error', this );
  // bind to image as well for Firefox. #191
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.proxyImage.src = this.img.currentSrc || this.img.src;
};

LoadingImage.prototype.getIsImageComplete = function() {
  // check for non-zero, non-undefined naturalWidth
  // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
  return this.img.complete && this.img.naturalWidth;
};

LoadingImage.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  let { parentNode } = this.img;
  // emit progress with parent <picture> or self <img>
  let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
  this.emitEvent( 'progress', [ this, elem, message ] );
};

// ----- events ----- //

// trigger specified handler for event type
LoadingImage.prototype.handleEvent = function( event ) {
  let method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

LoadingImage.prototype.onload = function() {
  this.confirm( true, 'onload' );
  this.unbindEvents();
};

LoadingImage.prototype.onerror = function() {
  this.confirm( false, 'onerror' );
  this.unbindEvents();
};

LoadingImage.prototype.unbindEvents = function() {
  this.proxyImage.removeEventListener( 'load', this );
  this.proxyImage.removeEventListener( 'error', this );
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

// -------------------------- Background -------------------------- //

function Background( url, element ) {
  this.url = url;
  this.element = element;
  this.img = new Image();
}

// inherit LoadingImage prototype
Background.prototype = Object.create( LoadingImage.prototype );

Background.prototype.check = function() {
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.img.src = this.url;
  // check if image is already complete
  let isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    this.unbindEvents();
  }
};

Background.prototype.unbindEvents = function() {
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

Background.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.element, message ] );
};

// -------------------------- jQuery -------------------------- //

ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
  jQuery = jQuery || window.jQuery;
  if ( !jQuery ) return;

  // set local variable
  $ = jQuery;
  // $().imagesLoaded()
  $.fn.imagesLoaded = function( options, onAlways ) {
    let instance = new ImagesLoaded( this, options, onAlways );
    return instance.jqDeferred.promise( $( this ) );
  };
};
// try making plugin
ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

return ImagesLoaded;

} );

/*!
 * Responsive Bootstrap Toolkit
 * Author:    Maciej Gurban
 * License:   MIT
 * Version:   2.6.3 (2016-06-21)
 * Origin:    https://github.com/maciej-gurban/responsive-bootstrap-toolkit
 */
var ResponsiveBootstrapToolkit = (function($){

    // Internal methods
    var internal = {

        /**
         * Breakpoint detection divs for each framework version
         */
        detectionDivs: {
            // Bootstrap 3
            bootstrap: {
                'xs': $('<div class="device-xs visible-xs visible-xs-block"></div>'),
                'sm': $('<div class="device-sm visible-sm visible-sm-block"></div>'),
                'md': $('<div class="device-md visible-md visible-md-block"></div>'),
                'lg': $('<div class="device-lg visible-lg visible-lg-block"></div>')
            },
            // Foundation 5
            foundation: {
                'small':  $('<div class="device-xs show-for-small-only"></div>'),
                'medium': $('<div class="device-sm show-for-medium-only"></div>'),
                'large':  $('<div class="device-md show-for-large-only"></div>'),
                'xlarge': $('<div class="device-lg show-for-xlarge-only"></div>')
            }
        },

         /**
         * Append visibility divs after DOM laoded
         */
        applyDetectionDivs: function() {
            $(document).ready(function(){
                $.each(self.breakpoints, function(alias){
                    self.breakpoints[alias].appendTo('.responsive-bootstrap-toolkit');
                });
            });
        },

        /**
         * Determines whether passed string is a parsable expression
         */
        isAnExpression: function( str ) {
            return (str.charAt(0) == '<' || str.charAt(0) == '>');
        },

        /**
         * Splits the expression in into <|> [=] alias
         */
        splitExpression: function( str ) {

            // Used operator
            var operator = str.charAt(0);
            // Include breakpoint equal to alias?
            var orEqual  = (str.charAt(1) == '=') ? true : false;

            /**
             * Index at which breakpoint name starts.
             *
             * For:  >sm, index = 1
             * For: >=sm, index = 2
             */
            var index = 1 + (orEqual ? 1 : 0);

            /**
             * The remaining part of the expression, after the operator, will be treated as the
             * breakpoint name to compare with
             */
            var breakpointName = str.slice(index);

            return {
                operator:       operator,
                orEqual:        orEqual,
                breakpointName: breakpointName
            };
        },

        /**
         * Returns true if currently active breakpoint matches the expression
         */
        isAnyActive: function( breakpoints ) {
            var found = false;
            $.each(breakpoints, function( index, alias ) {
                // Once first breakpoint matches, return true and break out of the loop
                if( self.breakpoints[ alias ].is(':visible') ) {
                    found = true;
                    return false;
                }
            });
            return found;
        },

        /**
         * Determines whether current breakpoint matches the expression given
         */
        isMatchingExpression: function( str ) {

            var expression = internal.splitExpression( str );

            // Get names of all breakpoints
            var breakpointList = Object.keys(self.breakpoints);

            // Get index of sought breakpoint in the list
            var pos = breakpointList.indexOf( expression.breakpointName );

            // Breakpoint found
            if( pos !== -1 ) {

                var start = 0;
                var end   = 0;

                /**
                 * Parsing viewport.is('<=md') we interate from smallest breakpoint ('xs') and end
                 * at 'md' breakpoint, indicated in the expression,
                 * That makes: start = 0, end = 2 (index of 'md' breakpoint)
                 *
                 * Parsing viewport.is('<md') we start at index 'xs' breakpoint, and end at
                 * 'sm' breakpoint, one before 'md'.
                 * Which makes: start = 0, end = 1
                 */
                if( expression.operator == '<' ) {
                    start = 0;
                    end   = expression.orEqual ? ++pos : pos;
                }
                /**
                 * Parsing viewport.is('>=sm') we interate from breakpoint 'sm' and end at the end
                 * of breakpoint list.
                 * That makes: start = 1, end = undefined
                 *
                 * Parsing viewport.is('>sm') we start at breakpoint 'md' and end at the end of
                 * breakpoint list.
                 * Which makes: start = 2, end = undefined
                 */
                if( expression.operator == '>' ) {
                    start = expression.orEqual ? pos : ++pos;
                    end   = undefined;
                }

                var acceptedBreakpoints = breakpointList.slice(start, end);

                return internal.isAnyActive( acceptedBreakpoints );

            }
        }

    };

    // Public methods and properties
    var self = {

        /**
         * Determines default debouncing interval of 'changed' method
         */
        interval: 300,

        /**
         *
         */
        framework: null,

        /**
         * Breakpoint aliases, listed from smallest to biggest
         */
        breakpoints: null,

        /**
         * Returns true if current breakpoint matches passed alias
         */
        is: function( str ) {
            if( internal.isAnExpression( str ) ) {
                return internal.isMatchingExpression( str );
            }
            return self.breakpoints[ str ] && self.breakpoints[ str ].is(':visible');
        },

        /**
         * Determines which framework-specific breakpoint detection divs to use
         */
        use: function( frameworkName, breakpoints ) {
            self.framework = frameworkName.toLowerCase();

            if( self.framework === 'bootstrap' || self.framework === 'foundation') {
                self.breakpoints = internal.detectionDivs[ self.framework ];
            } else {
                self.breakpoints = breakpoints;
            }

            internal.applyDetectionDivs();
        },

        /**
         * Returns current breakpoint alias
         */
        current: function(){
            var name = 'unrecognized';
            $.each(self.breakpoints, function(alias){
                if (self.is(alias)) {
                    name = alias;
                }
            });
            return name;
        },

        /*
         * Waits specified number of miliseconds before executing a callback
         */
        changed: function(fn, ms) {
            var timer;
            return function(){
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn();
                }, ms || self.interval);
            };
        }

    };

    // Create a placeholder
    $(document).ready(function(){
        $('<div class="responsive-bootstrap-toolkit"></div>').appendTo('body');
    });

    if( self.framework === null ) {
        self.use('bootstrap');
    }

    return self;

})(jQuery);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveBootstrapToolkit;
}

//Google Font Loader

//Localized font string from functions.php = germina.fonts

WebFontConfig = {
    google: { families: germina.fonts },
    active: function () {
        // var e = $(".archive.category-publicaciones .full-proylist.row");
        // var pre = $(".lastproys");
        // e.masonry("layout");
        // pre.masonry("layout");
    },
};
(function () {
    var wf = document.createElement("script");
    wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
    wf.type = "text/javascript";
    wf.async = "true";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wf, s);
})();

//Loader para proyectos

function germina_loadprojects(element, $masonrygrid) {
    let proyectlist = $("div.full-proylist");
    let dateSorterAjax = $(".date-sorter-ajax");
    let selectedOrder = $(".panel-heading.active .ajax-sort-button").attr(
        "data-sort"
    );
    let sortButton = $(".ajax-sort-button");
    let proyectsPerPage = parseInt(germina.proyects_per_page);
    let linkitem = element;
    let termid = element.attr("data-term");
    let tax = element.attr("data-tax");
    let reuse = parseInt(element.attr("data-reuse"));
    let curOffset = 0;
    let taxtitle = $("h2.taxtitle");
    let loadmore = $("body button.loadmore");
    let itemtype = element.attr("data-type")
        ? element.attr("data-type")
        : "resumen-proyecto";
    let itemTemplate = element.attr("data-item-template")
        ? element.attr("data-item-template")
        : "item-medium";

    console.log(selectedOrder);

    $(".proyect-call").removeClass("active");

    //console.log(reuse);

    if (reuse !== 0) {
        curOffset = proyectsPerPage * reuse;
        //añade un contador al data-reuse
        loadmore.attr("data-reuse", reuse + 1);
    } else {
        loadmore.attr("data-reuse", 1);
    }

    linkitem.addClass("loadingbtn");
    //console.log("offset", curOffset);

    sortButton.attr({
        "data-term": termid,
        "data-offset": curOffset,
        "data-type": itemtype,
        "data-tax": tax,
        "data-item-template": itemTemplate,
    });

    $.ajax({
        url: germina.ajax_url,
        type: "POST",
        data: {
            action: "germina_proyects_by_term",
            termid: termid,
            tax: tax,
            offset: curOffset,
            itemtype: itemtype,
            order: selectedOrder,
        },
        success: function (response) {
            if (reuse === 0) {
                proyectlist.empty();
            }

            $(".filter-heading-toggle").click();
            dateSorterAjax.fadeIn();

            var content = JSON.parse(response);

            let projectCount = $("p.project-results-count");
            let itemlabel = projectCount.attr("data-item-plural");
            let itemlabelsingular = projectCount.attr("data-item-singular");
            let proyectItemMedium = (item) => {
                //console.log(item.format);
                return `                       
                            <div class="proyect-item-medium animated zoomIn ${
                                item.post_thumbnail && "with-image"
                            }">
                                <a class="block-item-link" href="${
                                    item.post_link
                                }" title="${item.post_title}">
                                <div class="proyect-item-content-wrapper">
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                                        <div class="temas">
                                            <span>Temas:</span>
                                            ${item.post_temas}
                                        </div>
                                    </div>
                                </div>
                                ${
                                    item.post_thumbnail &&
                                    `<img src="${item.post_thumbnail}" alt="${item.post_title}">`
                                }
                                </a>
                            </div>             
                        `;
            };
            let documentItemMedium = (item) => {
                let icon = item.format.icon;
                return `<div class="document-item-medium zoomIn">
                <a class="block-item-link" href="${item.post_link}" title="${
                    item.post_title
                }">
                             ${
                                 item.doc_thumbnail
                                     ? `<img src="${item.doc_thumbnail}" alt="${item.post_title}">`
                                     : `<div class="icon-wrapper"><div><i class="${icon}"></i> ${item.format.content}</div></div>`
                             }

                    <h4>${item.post_title}</h4>    
                </a>
                </div>`;
            };

            if (content.items !== undefined) {
                //console.log(content);

                projectCount
                    .empty()
                    .append(
                        `<strong> ${content.total} ${
                            content.total > 1 ? itemlabel : itemlabelsingular
                        }</strong>`
                    );

                let elementsArr = [];
                content.items.map((item) => {
                    if (itemTemplate === "document") {
                        let element = documentItemMedium(item);
                        elementsArr.push(element);
                    } else {
                        proyectlist.append(
                            itemTemplate === "document"
                                ? documentItemMedium(item)
                                : proyectItemMedium(item)
                        );
                    }
                });

                if (itemTemplate == "document") {
                    proyectlist.masonry("destroy");
                    console.log("adding", elementsArr);
                    let $elements = $(elementsArr);
                    proyectlist.append(elementsArr).masonry();
                    proyectlist.masonry("layout");
                    proyectlist.imagesLoaded().progress(function () {
                        proyectlist.masonry("layout");
                    });
                    //$masonrygrid.append(elementsArr);
                    //$masonrygrid.masonry("layout");
                }

                //console.log("server offset", content.offset);
                if (content.isfinalquery === "remaining") {
                    loadmore
                        .attr("data-term", content["term_id"])
                        .attr("data-tax", content["tax_slug"])
                        .attr("data-type", itemtype)
                        .removeClass("hidden")
                        .fadeIn();
                }
            } else {
                projectCount.empty().append("0 " + itemlabel);
                proyectlist.append(
                    `<div class='col-md-12 proyect-items-wrapper'>
                        <div class="not-found-message">No se encontraron contenidos</div>
                    </div>`
                );
                $(".btn.loadmore").hide();
            }

            if (content.isfinalquery === "limit") {
                loadmore.hide();
            }

            linkitem.removeClass("loadingbtn");

            linkitem.addClass("active").removeClass("loading");

            taxtitle.empty().append(content["taxname"]);

            $('div[data-id="proyect-nav"]').removeClass("active");
        },
        error: function (error) {
            console.log("Error:", error);
        },
    });
}

//main js file
//stuff here
$(document).ready(function () {
    console.log("scripts germina v");
    var body = $("body");
    var brand = $("a.navbar-brand");
    var navbarwrap = $("nav.navbar-fixed-top");
    var navbar = $("#germina-menu");
    var togglenavbar = $(".navbar-toggle");
    var presentation = $(".presentation");

    var videocontrol = $(".video-control");
    var videobj = $(".germina-video-container video.video-germina");

    var proyectlist = $("div.full-proylist");
    var ptypenavitems = $("div.ptype-nav a.btn-typefilter");

    var typebuttons = $("div.ptype-nav a.btn-typefilter");

    let logocolor = $("img.logo-color");
    let logoblanco = $("img.logo-blanco");
    let dateSorterAjax = $(".date-sorter-ajax");

    dateSorterAjax.hide();

    typebuttons.each(function (index, element) {
        var filter = $(element).attr("data-filter");
        var countelements = $(
            'div.tax-item-medium[data-type="' +
                filter +
                '"], div.item-medium[data-type="' +
                filter +
                '"]'
        ).length;

        if (countelements < 1) {
            $(element).hide();
        }
    });

    videocontrol.on("click", function () {
        $(this)
            .empty()
            .append(
                '<video class="video-germina video-js" src="' +
                    germina.video_url +
                    '">Se necesita un navegador compatible con HTML5 para ver este video.</video>'
            );
    });

    //Filter type in taxview

    var allfilter = $('.ptype-nav a[data-filter="all"]');

    ptypenavitems.on("click", function () {
        var tofilter = $(this).attr("data-filter");
        var tofilterlabel = $(this).attr("data-filter-label");
        var taxitems = $("div.tax-item-medium, div.item-medium");
        var total = taxitems.length;
        let taxCount = $("p.taxonomy-results-count");

        if ($(this).hasClass("active")) {
            taxitems.show();
            $(this).removeClass("active");
            taxCount
                .empty()
                .append(`<strong>${total} ${tofilterlabel}</strong>`);
        } else {
            taxitems.hide();
            console.log(
                $('div[data-type="' + tofilter + '"]').length,
                "numero articulos"
            );

            let noFiltered = $('div[data-type="' + tofilter + '"]').length;
            $('div[data-type="' + tofilter + '"]').show();

            allfilter.removeClass("active");
            ptypenavitems.removeClass("active");

            taxCount
                .empty()
                .append(`<strong>${noFiltered} ${tofilterlabel}</strong>`);

            $(this).toggleClass("active");
        }
    });

    allfilter.on("click", function () {
        console.log("all");
        let taxCount = $("p.taxonomy-results-count");
        var taxitems = $("div.tax-item-medium, div.item-medium");
        ptypenavitems.removeClass("active");
        taxitems.show();
        taxCount
            .empty()
            .append(`<strong>${taxitems.length} contenidos</strong>`);
        $(this).addClass("active");
    });

    let $grid = $(".archive.category-publicaciones .full-proylist.row");
    // let $pregrid = $(".lastproys").masonry({
    //     itemSelector: ".document-item-medium",
    //     columnWidth: 208,
    // });
    //masonry in docs
    // let $grid = $(".archive.category-publicaciones .full-proylist.row").masonry(
    //     {
    //         itemSelector: ".document-item-medium",
    //     }
    // );
    // $pregrid.imagesLoaded().progress(function () {
    //     $pregrid.masonry("layout");
    // });

    //Ajax calls for proyects

    $("body").on("click", ".proyect-call", function () {
        //Cosas que hacer
        //1. Impedir que se solicite mientras está cargando
        if ($(this).hasClass("loading") !== true) {
            $(this).addClass("loading");

            //para el resorter
            if ($(this).hasClass("ajax-sort-button")) {
                $(".full-proylist.row").empty();
                $(".order-filter .panel-heading").removeClass("active");
                $(this).parent().parent().addClass("active");
                $("span.labelorder")
                    .empty()
                    .text($(this).attr("data-sort-label"));
                $();
            }
            germina_loadprojects($(this), $grid);
        } //End comprobation of loading class
    });

    //Portafolio
    var portafolio = $("body.home .portafolio-content");

    portafolio.cycle({
        slides: "> .item-large",
        fx: "fade",
        timeout: 0,
        pager: ".cycle-pager",
        prev: ".cycle-prev",
        next: ".cycle-next",
        swipe: true,
        "swipe-fx": "none",
    });

    portafolio.on(
        "cycle-update-view",
        function (event, optionHash, slideOptionHash, currentslideEl) {
            $(".animated", portafolio).hide();
            $(".animated", currentslideEl).show();
        }
    );

    $("#taxonomy-accordion").on("shown.bs.collapse", function () {
        $(".panel-collapse.in").prev(".panel-heading").addClass("active");
        $(".panel-collapse.in").parent(".panel-default").addClass("active");
    });

    $("#taxonomy-accordion").on("hide.bs.collapse", function () {
        $(".tax-filter .panel-heading").removeClass("active");
        $(".panel-default.active").removeClass("active");
    });

    $(".panel-taxonomy-shortcode").on("shown.bs.collapse", function () {
        $(this).addClass("active");
    });

    $(".panel-taxonomy-shortcode").on("hide.bs.collapse", function () {
        $(this).removeClass("active");
    });

    $('a[data-toggle="showparent"]').on("click", function () {
        $("#taxonomy-accordion").show();
        $(".subpanel").not(".hidden").addClass("hidden");
    });

    $(".childterms-call").on("click", function () {
        let slug = $(this).attr("data-termslug");
        $("#taxonomy-accordion").hide();
        $("#childpanel-" + slug).removeClass("hidden");
    });

    goBack = $("a.goback");
    goBack.hide();

    $(window).on("scroll", function () {
        offset = window.pageYOffset;

        if (offset > 300) {
            goBack.fadeIn();
        }
        if (offset < 300) {
            goBack.fadeOut();
        }
    });

    goBack.on("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $(".dropdown a.dropdown-submenu").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("dropdown click");
        let nextDropdown = $(this).next(".dropdown-menu");
        if (nextDropdown.hasClass("open")) {
            nextDropdown.hide().removeClass("open");
        } else {
            nextDropdown.show().addClass("open");
        }
    });

    // Wrap IIFE around your code
    (function ($, viewport) {
        $(document).ready(function () {
            // Executes only in XS breakpoint
            if (viewport.is("xs")) {
                $(window).on("scroll", function () {});

                navbar.on("show.bs.collapse", function () {
                    navbarwrap.addClass("unfolded");
                });

                navbar.on("hidden.bs.collapse", function () {
                    if (presentation.visible()) {
                        //brand.fadeOut();
                        //navbar.addClass("without-brand");
                    }
                    $(".navbar-header").removeClass("open");

                    navbarwrap.removeClass("unfolded");
                });

                //Botones que muestran navegación
                $('a[data-function="toggle-nav"]').on("click", function () {
                    var el = $(
                        '[data-id="' + $(this).attr("data-target") + '"]'
                    );

                    if (el.hasClass("active")) {
                        el.removeClass("active");
                    } else {
                        el.addClass("active");
                    }
                });

                //Colapsable de filtros para móvil
                $(".filter-heading-toggle").on("click", function () {
                    let dataTarget = $($(this).attr("data-target"));
                    $(this).toggleClass("active");
                    dataTarget.toggleClass("active");
                    $("p.search-results-count").toggleClass("active");
                });
            }

            // Executes in SM, MD and LG breakpoints
            if (viewport.is(">=sm")) {
                // console.log("proyectos-home");
                // // $(".proyectos-home, .full-proylist").masonry({
                // //     itemSelector: ".proyect-item-box",
                // // });
                // var $grid = $(".full-publist-items").imagesLoaded(function () {
                //     $grid.masonry({
                //         itemSelector: ".col-md-6",
                //     });
                // });
                // var $pubgrid = $(".publicaciones-wrapper").imagesLoaded(
                //     function () {
                //         $pubgrid.masonry({
                //             itemSelector: ".publicacion-item-medium",
                //         });
                //     }
                // );
                // var $attachedgrid = $(
                //     "div.attached-to-post.Miniaturas"
                // ).imagesLoaded(function () {
                //     $attachedgrid.masonry({
                //         itemSelector: ".attached-file-block",
                //     });
                // });
            }

            // Executes in XS and SM breakpoints
            if (viewport.is("<md")) {
                //...
            }

            // Execute code each time window size changes
            $(window).resize(
                viewport.changed(function () {
                    if (viewport.is("xs")) {
                        // ...
                    }
                })
            );
        });
    })(jQuery, ResponsiveBootstrapToolkit);
});
