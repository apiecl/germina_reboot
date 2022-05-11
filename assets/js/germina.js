(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Mustache = factory());
}(this, (function () { 'use strict';

  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `config` argument is given here, then it should be an
   * object with a `tags` attribute or an `escape` attribute or both.
   * If an array is passed, then it will be interpreted the same way as
   * a `tags` attribute on a `config` object.
   *
   * The `tags` attribute of a `config` object must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   *
   * The `escape` attribute of a `config` object must be a function which
   * accepts a string as input and outputs a safely escaped string.
   * If an `escape` function is not provided, then an HTML-safe string
   * escaping function is used as the default.
   */
  Writer.prototype.render = function render (template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, config) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context, config);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      var tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null)
      return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function getConfigTags (config) {
    if (isArray(config)) {
      return config;
    }
    else if (config && typeof config === 'object') {
      return config.tags;
    }
    else {
      return undefined;
    }
  };

  Writer.prototype.getConfigEscape = function getConfigEscape (config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    }
    else {
      return undefined;
    }
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.2.0',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view`, `partials`, and `config`
   * using the default writer.
   */
  mustache.render = function render (template, view, partials, config) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, config);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;

})));

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

'use strict';

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
        var e = jQuery(".proyectos-home, .full-proylist");
        e.masonry("layout");
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

function germina_loadprojects(element) {
    var proyectlist = $("div.full-proylist");
    var proyectsPerPage = parseInt(germina.proyects_per_page);
    var linkitem = element;
    var termid = element.attr("data-term");
    var tax = element.attr("data-tax");
    var reuse = parseInt(element.attr("data-reuse"));
    var curOffset = 0;
    var taxtitle = $("h2.taxtitle");
    var loadmore = $("body button.loadmore");

    $(".proyect-call").removeClass("active");

    console.log(reuse);

    if (reuse !== 0) {
        var curOffset = proyectsPerPage * reuse;

        //añade un contador al data-reuse

        linkitem.attr("data-reuse", reuse + 1);
    } else {
        loadmore.attr("data-reuse", 1);
    }

    linkitem.append(
        ' <span class="loading-status"><i class="fa fa-spin fa-circle-o-notch"></i></span>'
    );

    $.ajax({
        url: germina.ajax_url,
        type: "post",
        data: {
            action: "germina_proyects_by_term",
            termid: termid,
            tax: tax,
            offset: curOffset,
        },
        success: function (response) {
            if (reuse === 0) {
                proyectlist.empty();
            }

            var content = JSON.parse(response);

            if (content.items !== undefined) {
                // var template = fetch(content["template"])
                // .then((response) => response.text())
                // .then((template) => {
                //     var rendered = Mustache.render(template, content);
                //     console.log(content.items);
                //     proyectlist.append(rendered);
                // });

                content.items.map((item) => {
                    if (item.post_thumbnail) {
                        proyectlist.append(`
                        <div class="col-md-12 proyect-items-wrapper">
                            <div class="proyect-item-medium animated zoomIn with-image">

                                <a class="block-item-link" href="${item.post_link}">

                                <div class="proyect-item-content-wrapper">
                                    <div class="proyect-item-meta-top">
                                        <span class="area">${item.post_area}</span>
                                        <i class="fa fa-angle-left"></i>
                                        <span class="fecha">${item.post_year}</span>
                                    </div>
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                    
                                        <span class="temas">
                                            ${item.post_temas}
                                        </span>
                                    </div>
                                </div>
                                <img src="${item.post_thumbnail}" alt="${item.post_title}">
                                </a>
                            </div>
                        </div>
                        `);
                    } else {
                        proyectlist.append(`
                        <div class="col-md-12 proyect-items-wrapper">
                            <div class="proyect-item-medium animated zoomIn">

                                <a class="block-item-link" href="${item.post_link}">

                                <div class="proyect-item-content-wrapper">
                                    <div class="proyect-item-meta-top">
                                        <span class="area">${item.post_area}</span>
                                        <i class="fa fa-angle-left"></i>
                                        <span class="fecha">${item.post_year}</span>
                                    </div>
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                    
                                        <span class="temas">
                                            ${item.post_temas}
                                        </span>
                                    </div>
                                </div>
                                </a>
                            </div>
                        </div>
                        `);
                    }
                });

                loadmore
                    .attr("data-term", content["term_id"])
                    .attr("data-tax", content["tax_slug"])
                    .removeClass("hidden")
                    .fadeIn();
            } else {
                proyectlist.append(
                    "<div class='col-md-12 proyect-items-wrapper'>No se encontraron contenidos</div>"
                );
            }

            $("span", linkitem).remove();

            //console.log(content);

            linkitem.addClass("active").removeClass("loading");

            //var html = Mustache.render( template, content);

            taxtitle.empty().append(content["taxname"]);

            //console.log(content, template);

            //proyectlist.append(html);

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
    var body = $("body");
    var brand = $("a.navbar-brand");
    var navbar = $("#germina-menu");
    var togglenavbar = $(".navbar-toggle");
    var presentation = $(".presentation");

    var videocontrol = $(".video-control");
    var videobj = $(".germina-video-container video.video-germina");

    var proyectlist = $("div.full-proylist");
    var ptypenavitems = $("div.ptype-nav a");

    var typebuttons = $("div.ptype-nav a");

    typebuttons.each(function (index, element) {
        var filter = $(element).attr("data-filter");
        var countelements = $(
            'div.tax-item-medium[data-type="' + filter + '"]'
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

    ptypenavitems.on("click", function () {
        var tofilter = $(this).attr("data-filter");
        var taxitems = $("div.tax-item-medium");

        if ($(this).hasClass("active")) {
            taxitems.show();
            $(this).removeClass("active");
        } else {
            taxitems.hide();

            $('div[data-type="' + tofilter + '"]').show();

            ptypenavitems.removeClass("active");
            $(this).toggleClass("active");
        }
    });

    //Ajax calls for proyects

    $("body").on("click", ".proyect-call", function () {
        //Cosas que hacer
        //1. Impedir que se solicite mientras está cargando
        if ($(this).hasClass("loading") !== true) {
            $(this).addClass("loading");

            germina_loadprojects($(this));
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

    // Wrap IIFE around your code
    (function ($, viewport) {
        $(document).ready(function () {
            // Executes only in XS breakpoint
            if (viewport.is("xs")) {
                if (body.hasClass("home")) {
                    brand.hide();
                    navbar.addClass("without-brand");
                }

                $(window).on("scroll", function () {
                    if (presentation.visible()) {
                        brand.fadeOut();
                        navbar.addClass("without-brand");
                    } else {
                        brand.show();
                        navbar.removeClass("without-brand");
                    }
                });

                navbar.on("show.bs.collapse", function () {
                    if (brand.visible() === false) {
                        brand.show();
                        navbar.removeClass("without-brand");
                    }
                });

                navbar.on("hidden.bs.collapse", function () {
                    if (presentation.visible()) {
                        brand.fadeOut();
                        navbar.addClass("without-brand");
                    }
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
            }

            // Executes in SM, MD and LG breakpoints
            if (viewport.is(">=sm")) {
                console.log("proyectos-home");
                $(".proyectos-home, .full-proylist").masonry({
                    itemSelector: ".proyect-item-box",
                });

                var $grid = $(".full-publist-items").imagesLoaded(function () {
                    $grid.masonry({
                        itemSelector: ".col-md-6",
                    });
                });

                var $pubgrid = $(".publicaciones-wrapper").imagesLoaded(
                    function () {
                        $pubgrid.masonry({
                            itemSelector: ".publicacion-item-medium",
                        });
                    }
                );

                var $attachedgrid = $(
                    "div.attached-to-post.Miniaturas"
                ).imagesLoaded(function () {
                    $attachedgrid.masonry({
                        itemSelector: ".attached-file-block",
                    });
                });
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
