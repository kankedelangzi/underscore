// Underscore.js
// (c) 2009 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the terms of the MIT license.
// Portions of Underscore are inspired by or borrowed from Prototype.js,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore/
// http://www.css88.com/doc/underscore/

(function() {

  /*------------------------- Baseline setup ---------------------------------*/

  // Establish the root object, "window" in the browser, or "global" on the server.
  var root = this;// 这里的this就是window

  // Save the previous value of the "_" variable.
  // 先保存在这个函数运行之前定义的window._  的变量或函数
  var previousUnderscore = root._;

  // Create a safe reference to the Underscore object for the functions below.
  // 重新定义window._ 为一个新对象并且给他一个内部使用的别名 '_'
  var _ = root._ = {};

  // Export the Underscore object for CommonJS.
  // 如果支持Es6 exports 那么直接抛出
  if (typeof exports !== 'undefined') _ = exports;

  // Current version.
  // 定义版本号
  _.VERSION = '0.3.3';

  /*
      _ = {
        01 : each
        02 : map
  }
   */

  /*------------------------ Collection Functions: ---------------------------*/

  // The cornerstone, an each implementation.
  // Handles objects implementing forEach, each, arrays, and raw objects.
  _.each = function(obj, iterator, context) {
    var index = 0;
    try {
      if (obj.forEach) {
        obj.forEach(iterator, context);
      } else if (obj.length) {
        for (var i=0, l = obj.length; i<l; i++) iterator.call(context, obj[i], i, obj);
      } else if (obj.each) {
        obj.each(function(value) { iterator.call(context, value, index++, obj); });
      } else {
        for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } catch(e) {
      if (e != '__break__') throw e;
    }
    return obj;
  };

  // Return the results of applying the iterator to each element. Use JavaScript
  // 1.6's version of map, if possible.
  _.map = function(obj, iterator, context) {
    if (obj && obj.map) return obj.map(iterator, context);
    var results = [];
    _.each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  // Reduce builds up a single result from a list of values. Also known as
  // inject, or foldl. Uses JavaScript 1.8's version of reduce, if possible.
  /*
        reduce() 方法接收一个函数作为累加器（accumulator），数组中的每个值（从左到右）开始合并，最终为一个值。
        [0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
                            return previousValue + currentValue;
                },initialValue=10);
                callback
        执行数组中每个值的函数，包含四个参数
        previousValue
        上一次调用回调返回的值，或者是提供的初始值（initialValue）
        currentValue
        数组中当前被处理的元素
        index
        当前元素在数组中的索引
        array
        调用 reduce 的数组
        initialValue
        作为第一次调用 callback 的第一个参数。

   */
  _.reduce = function(obj, memo, iterator, context) {
    if (obj && obj.reduce) return obj.reduce(_.bind(iterator, context), memo);
    _.each(obj, function(value, index, list) {
      memo = iterator.call(context, memo, value, index, list);
    });
    return memo;
  };

  // The right-associative version of reduce, also known as foldr. Uses
  // JavaScript 1.8's version of reduceRight, if available.
  _.reduceRight = function(obj, memo, iterator, context) {
    if (obj && obj.reduceRight) return obj.reduceRight(_.bind(iterator, context), memo);
    var reversed = _.clone(_.toArray(obj)).reverse();// 将数组逆序
    _.each(reversed, function(value, index) {
      memo = iterator.call(context, memo, value, index, obj);
    });
    return memo;
  };

  // Return the first value which passes a truth test.
  _.detect = function(obj, iterator, context) {
    var result;
    _.each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        throw '__break__';
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test. Use JavaScript 1.6's
  // filter(), if it exists.
  _.select = function(obj, iterator, context) {
    if (obj.filter) return obj.filter(iterator, context);
    var results = [];
    _.each(obj, function(value, index, list) {
        // 这里设置是在是妙 可见这个前边的函数如果返回的是真，那么后边就会执行，就会把这个value放到数组中等待返回
      iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    _.each(obj, function(value, index, list) {
        // 这个功能是与filter也就是select相反的
      !iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Determine whether all of the elements match a truth test. Delegate to
  // JavaScript 1.6's every(), if it is present.
  _.all = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (obj.every) return obj.every(iterator, context);
    var result = true;
    _.each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) throw '__break__';
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test. Use
  // JavaScript 1.6's some(), if it exists.
  _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (obj.some) return obj.some(iterator, context);
    var result = false;
    _.each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) throw '__break__';
    });
    return result;
  };

  // Determine if a given value is included in the array or object,
  // based on '==='.
  _.include = function(obj, target) {
    if (_.isArray(obj)) return _.indexOf(obj, target) != -1;
    var found = false;
    _.each(obj, function(value) {
      if (found = value === target) {
        throw '__break__';
      }
    });
    return found;
  };

  // Invoke a method with arguments on every item in a collection.
  // _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
  //=> [[1, 5, 7], [1, 2, 3]]
  //这个有点怪
  _.invoke = function(obj, method) {
    var args = _.toArray(arguments).slice(2);
    return _.map(obj, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };

  // Convenience version of a common use case of map: fetching a property.
  /*
      var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
        _.pluck(stooges, 'name');
        => ["moe", "larry", "curly"]
   */
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum item or (item-based computation).
  /*
    var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
    _.max(stooges, function(stooge){ return stooge.age; });
    => {name: 'curly', age: 60};
   */
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    _.each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    _.each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criteria produced by an iterator.
  /*
          sortBy_.sortBy(list, iteratee, [context])
          返回一个排序后的list拷贝副本。如果传递iteratee参数，iteratee将作为list中每个值的排序依据。用来进行排序迭代器也可以是属性名称的字符串(比如 length)。

          _.sortBy([1, 2, 3, 4, 5, 6], function(num){ return Math.sin(num); });
          => [5, 4, 6, 3, 1, 2]

          下边这个是后期版本
          var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
          _.sortBy(stooges, 'name');
          => [{name: 'curly', age: 60}, {name: 'larry', age: 50}, {name: 'moe', age: 40}];
   */
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator = iterator || _.identity;
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable) return [];
    if (_.isArray(iterable)) return iterable;
    return _.map(iterable, function(val){ return val; });
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  /*-------------------------- Array Functions: ------------------------------*/

  // Get the first element of an array.
  _.first = function(array) {
    return array[0];
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  /*
    返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
    _.compact([0, 1, false, 2, '', 3]);
    => [1, 2, 3]
   */
  _.compact = function(array) {
    return _.select(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  /*
  flatten_.flatten(array)
    将一个嵌套多层的数组 array（数组） (嵌套可以是任何层数)转换为只有一层的数组。 如果你传递 shallow参数，数组将只减少一维的嵌套。

    _.flatten([1, [2], [3, [[4]]]]);
    => [1, 2, 3, 4];

    _.flatten([1, [2], [3, [[4]]]], true);
    => [1, 2, 3, [[4]]];
   */
  _.flatten = function(array) {
    return _.reduce(array, [], function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo.push(value);
      return memo;
    });
  };

  // Return a version of the array that does not contain the specified value(s).
  /*
  返回一个删除所有values值的 array副本。（愚人码头注：使用===表达式做相等测试。）
    从这个名字上看就是去掉数组中的0 和1
    _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
    => [2, 3, 4]
   */
  _.without = function(array) {
    var values = array.slice.call(arguments, 0);
    return _.select(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  /*
    返回传入的 arrays（数组）并集：按顺序返回，数组的元素是唯一的，可以传入一个或多个 arrays（数组）。
        _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
        => [1, 2, 3, 101, 10]
   */
   _.uniq = function(array, isSorted) {
    return _.reduce(array, [], function(memo, el, i) {
      if (0 == i || (isSorted ? _.last(memo) != el : !_.include(memo, el))) memo.push(el);
      return memo;
    });
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = _.toArray(arguments).slice(1);
    return _.select(_.uniq(array), function(item) {
      return _.all(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  /*
    将 每个相应位置的arrays的值合并在一起。在合并分开保存的数据时很有用. 如果你用来处理矩阵嵌套数组时, _.zip.apply 可以做类似的效果。

    _.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]);
    => [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]

    _.zip.apply(_, arrayOfRowsOfData);
    => arrayOfColumnsOfData
    其实是实现了矩阵的转换
   */
  _.zip = function() {
    var args = _.toArray(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i=0; i<length; i++) results[i] = _.pluck(args, String(i));
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, MSIE),
  // we need this function. Return the position of the first occurence of an
  // item in an array, or -1 if the item is not included in the array.
  _.indexOf = function(array, item) {
    if (array.indexOf) return array.indexOf(item);
    for (i=0, l=array.length; i<l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Provide JavaScript 1.6's lastIndexOf, delegating to the native function,
  // if possible.
  _.lastIndexOf = function(array, item) {
    if (array.lastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  /* ----------------------- Function Functions: -----------------------------*/

  // Create a function bound to a given object (assigning 'this', and arguments,
  // optionally). Binding with arguments is also known as 'curry'.
  /*
      bind_.bind(function, object, [*arguments])
        绑定函数 function 到对象 object 上, 也就是无论何时调用函数, 函数里的 this 都指向这个 object. 任意可选参数 arguments 可以绑定到函数 function , 可以填充函数所需要的参数, 这也被成为 partial application。
        (愚人码头注：partial application翻译成“部分应用”或者“偏函数应用”。partial application可以被描述为一个函数，它接受一定数目的参数，绑定值到一个或多个这些参数，并返回一个新的函数，这个返回函数只接受剩余未绑定值的参数。参见：http://en.wikipedia.org/wiki/Partial_application。感谢@一任风月忆秋年的建议)。

        var func = function(greeting){ return greeting + ': ' + this.name };
        func = _.bind(func, {name: 'moe'}, 'hi');
        func();
        => 'hi: moe'
   */
  _.bind = function(func, context) {
    if (!context) return func;
    var args = _.toArray(arguments).slice(2);
    return function() {
            //请注意，这里的arguments和上边的arguments是不同的，这是bind之后的函数调用的时候传入的参数列表
      var a = args.concat(_.toArray(arguments));
      return func.apply(context, a);
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function() {
    var args = _.toArray(arguments);
    var context = args.pop();
    _.each(args, function(methodName) {
      context[methodName] = _.bind(context[methodName], context);
    });
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = _.toArray(arguments).slice(2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(_.toArray(arguments).slice(1)));
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(_.toArray(arguments));
      return wrapper.apply(wrapper, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  /*
    compose_.compose(*functions)
        返回函数集 functions 组合后的复合函数, 也就是一个函数执行完之后把返回的结果再作为参数赋给下一个函数来执行. 以此类推. 在数学里, 把函数 f(), g(), 和 h() 组合起来可以得到复合函数 f(g(h())).

        var greet    = function(name){ return "hi: " + name; };
        var exclaim  = function(statement){ return statement.toUpperCase() + "!"; };
        var welcome = _.compose(greet, exclaim);
        welcome('moe');
        => 'hi: MOE!'
   */
  _.compose = function() {
    var funcs = _.toArray(arguments);
    return function() {
      for (var i=funcs.length-1; i >= 0; i--) {
        arguments = [funcs[i].apply(this, arguments)];
      }
      return arguments[0];
    };
  };

  /* ------------------------- Object Functions: ---------------------------- */

  // Retrieve the names of an object's properties.
  _.keys = function(obj) {
    return _.map(obj, function(value, key){ return key; });
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Extend a given object with all of the properties in a source object.
  _.extend = function(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (_.isArray(obj)) return obj.slice(0);
    return _.extend({}, obj);
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value a real Array?
  _.isArray = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  };

  // Is a given value a Function?
  _.isFunction = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Function]';
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return typeof obj == 'undefined';
  };

  /* -------------------------- Utility Functions: -------------------------- */

  // Run Underscore.js in noConflict mode, returning the '_' variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  _.uniqueId = function(prefix) {
    var id = this._idCounter = (this._idCounter || 0) + 1;
    return prefix ? prefix + id : id;
  };

  // JavaScript templating a-la ERB, pilfered from John Resig's
  // "Secrets of the JavaScript Ninja", page 83.
  _.template = function(str, data) {
    var fn = new Function('obj',
      'var p=[],print=function(){p.push.apply(p,arguments);};' +
      'with(obj){p.push(\'' +
      str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
    + "');}return p.join('');");
    return data ? fn(data) : fn;
  };

  /*------------------------------- Aliases ----------------------------------*/

  _.forEach  = _.each;
  _.foldl    = _.inject       = _.reduce;
  _.foldr    = _.reduceRight;
  _.filter   = _.select;
  _.every    = _.all;
  _.some     = _.any;

})();
