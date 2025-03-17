var core = require('mathjs/core');

var math = core.create();

math.config({
    number: 'number',
    matrix: 'Array'
});

math.import(require('mathjs/lib/constants'));
math.import(require('mathjs/lib/type/number'));
math.import(require('mathjs/lib/type/matrix'));

math.import(require('mathjs/lib/function/arithmetic'));
math.import(require('mathjs/lib/function/trigonometry'));
math.import(require('mathjs/lib/function/relational'));
math.import(require('mathjs/lib/function/matrix/range'));
math.import(require('mathjs/lib/function/matrix/map'));

math.import(require('mathjs/lib/function/statistics/sum'));
math.import(require('mathjs/lib/function/statistics/prod'));
math.import(require('mathjs/lib/function/statistics/min'));
math.import(require('mathjs/lib/function/statistics/max'));

math.import(require('mathjs/lib/expression/function/parse'));

window.math = math;