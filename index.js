(function() {
  var isNumeric, toml,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  isNumeric = function(n) {
    return !isNaN(parseInt(n, 10));
  };

  toml = function(input) {
    var accum, char, context, count, delimiters, eat, group, i, ignore, key, list, lists, nesting, newlines, part, prev, quotes, root, skip, state, token, value, values, whitespace, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    root = {};
    context = root;
    newlines = "\n\r";
    whitespace = "\t ";
    delimiters = "[].=";
    quotes = "\"'";
    state = null;
    ignore = [null, 'newline', 'whitespace'];
    values = ['number', 'string', 'date'];
    count = 0;
    skip = 0;
    accum = '';
    token = null;
    key = null;
    value = null;
    list = null;
    lists = {};
    nesting = -1;
    prev = null;
    eat = function(char, reg, st) {
      if (!reg.test(char)) {
        state = st;
        token = accum;
        accum = '';
        return true;
      } else {
        accum += char;
        return false;
      }
    };
    _ref = input.toString() + "\n";
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      char = _ref[i];
      if (--skip > 0) {
        continue;
      }
      if (!state && __indexOf.call(newlines, char) >= 0) {
        state = 'newline';
      }
      if (char === '#') {
        state = 'comment';
      }
      if (state === 'comment') {
        if (__indexOf.call(newlines, char) < 0) {
          continue;
        } else {
          state = 'newline';
        }
      }
      if ((state === 'whitespace' || state === 'expect_value') && __indexOf.call(whitespace, char) >= 0) {
        continue;
      }
      if (__indexOf.call(newlines, prev) >= 0 && __indexOf.call(whitespace, char) >= 0) {
        state = 'whitespace';
        continue;
      }
      if (__indexOf.call(ignore, state) >= 0 && char === '[') {
        state = 'group';
        continue;
      }
      if (state === 'group' && eat(char, /[\w.]/)) {
        group = token;
      }
      if (group) {
        context = root;
        _ref1 = group.split('.');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          part = _ref1[_j];
          context = (_ref2 = context[part]) != null ? _ref2 : context[part] = {};
        }
        group = null;
      }
      if (__indexOf.call(ignore, state) >= 0 && /\w/.test(char)) {
        state = 'key';
      }
      if (state === 'key' && eat(char, /[\w-_]/)) {
        key = token;
      }
      if (key && char === '=') {
        state = 'expect_value';
        continue;
      }
      if (state === 'expect_value') {
        if (__indexOf.call(quotes, char) >= 0) {
          state = 'string';
          continue;
        }
        if (char === 't' && input.slice(i, +(i + 3) + 1 || 9e9) === 'true') {
          value = true;
          skip = 4;
          state = null;
        }
        if (char === 'f' && input.slice(i, +(i + 4) + 1 || 9e9) === 'false') {
          value = false;
          skip = 5;
          state = null;
        }
        if (char === '-') {
          state = 'number';
          accum = '-';
          continue;
        }
        if (isNumeric(char)) {
          state = 'number';
        }
        if (char === '[') {
          list = lists[++nesting] = [];
          continue;
        }
      }
      if (state === 'string' && eat(char, /[^"']/)) {
        value = token.replace(/\\n/, "\n");
      }
      if (state === 'number' && eat(char, /[\d.]/, 'number_end')) {
        value = +token;
      }
      if (state === 'date' && eat(char, /[\d-:TZ]/)) {
        value = new Date(token);
      }
      if (state === 'number_end') {
        if (char === '-') {
          state = 'date';
          accum = token + char;
          value = null;
        } else {
          state = null;
        }
      }
      if (list != null) {
        if (value != null) {
          list.push(value);
          value = null;
          state = 'expect_value';
        }
        if (char === ',') {
          continue;
        }
        if (char === ']') {
          if (nesting === 0) {
            value = list;
            list = null;
            nesting = -1;
            state = null;
          }
          if (nesting > 0) {
            lists[--nesting].push(list);
            list = lists[nesting];
          }
        }
      }
      if (key && (value != null)) {
        context[key] = value;
        key = value = null;
      }
      prev = char;
    }
    return root;
  };

  if (typeof exports !== 'undefined') {
    module.exports = toml;
  } else {
    this.toml = toml;
  }

}).call(this);
