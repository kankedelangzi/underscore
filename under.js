var _ = {
    each: function(obj, iterator, context) {
        /*
            遍历方法
            obj 要遍历的集合  可能是 数组    对象   类数组   对象数组{“0”："a","1":"b","2":"c" }
            对遍历得到的每一项执行 iterator函数  iterator（ item  ， index， obj   ）
            第三个参数是函数的执行环境，可以不传
         */
        var index = 0;
        if (obj.forEach) { // 原生的方法
            obj.forEach(iterator, context);
        } else if (obj.length) {
            for (; index < obj.length; index++) {
                iterator.call(context,obj[index],index,obj);
            }
        }else if(obj.each){
            obj.each((value => {
                iterator.call(context,value,index++,obj);
            }));
        }else{
            for (var value in obj) {
                if (object.hasOwnProperty(value)) {
                    iterator.call(context,value,index++,obj);
                }
            }
        }

    },
    map:function(obj, iterator, context){
        /*
            根据原生的map方法如果传入一个数组，第二个参数传入一个处理函数，
            对每一个item项进行遍历，然后返回处理后的结果
         */
        var res = [];
        if(obj.map){
            return obj.map(iterator, context);
        }else{
            this.each(obj,(value,index)=>{
                res.push(iterator.call(context,value,index,obj));
            });

        }
        return res;
    },
    reduce: function(obj, memo, iterator, context){
        if(obj.reduce) return obj.reduce(_.bind(iterator,context),memo);
        _.each(obj,(value,index,list)=>{
            memo = iterator.call(context,memo,value,index,list);
        });
        return memo;
    },

    detect: function(obj, iterator, context) {
      var result;
      _.each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
          result = value;
          throw '__break__';
        }
      });
      return result;
  },
  filter: function(obj, iterator, context){
      var res = [];
    if(obj.filter) return obj.filter(iterator, context);
    this.each(obj,function(value, index, list){
        iterator.call(context,value,index,list)&&res.push(value);
    });
    return res;
  },

    bind : function(func, context) {
      if (!context) return func;
      var args = _.toArray(arguments).slice(2);
      return function() {
        var a = args.concat(_.toArray(arguments));
        return func.apply(context, a);
      };
    }
};

var arr = ["q","w","e","r"];
var obj = {
    "0":"a",
    "1":"b",
    length: 2
};

//_.each(obj,console.log);

// var arr1 = _.map(obj,function(a){
//     return "---" + a;
// });
// console.log(arr1);
// console.log(_.reduce(obj,"0",function(memo,value,index,obj){
//     return memo + value;
// }));
// console.log(_.detect(arr,function(value, index, list){
//     return value == "w";
// }));

// console.log(_.filter(arr,function(v){
//     return v=="w" || v =="r";
// }));
console.log("name".call(null,{'name':"Yuu",age:18}));
