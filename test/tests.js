/**
 * Created by root on 17.07.14.
 */


var COUNT = 1000000;
var framecut = require("./../framecut");

function Delim(times, finish){
    var count = 0;
    framecut.initByDelimiter(function(){
        if(++count == times) finish()
    }, "\n");

    do_times(times/2, sendOneDelimFrameInParts)
}
function Delim2(times, finish){
    var count = 0;
    framecut.initByDelimiter(function(){
        if(++count == times) finish()
    }, "\n");

    do_times(times/2, sendOneDelimFrameSticked)
}
function Length(times, finish){
    var count = 0;
    framecut.initByLength(function(){
        if(++count == times) finish()
    }, 1, false);

    do_times(times/2, sendOneLengthFrameInParts);

}
function Length2(times, finish){
    var count = 0;
    framecut.initByLength(function(){
        if(++count == times) finish()
    }, 1, false);

    do_times(times/2, sendOneLengthFrameSticked);

}


function sendOneLengthFrameInParts(){
    var c = {};
    var b = new Buffer([10,0,1,2,3,4,5]);
    framecut.handleFrame(b,c);
    b = new Buffer([6,7,8,9]);
    framecut.handleFrame(b, c);
    b = new Buffer([10,0,1,2,3,4,5]);
    framecut.handleFrame(b,c);
    b = new Buffer([6,7,8,9]);
    framecut.handleFrame(b, c);
}
function sendOneLengthFrameSticked(){
    var c = {};
    var b = new Buffer([4,0,1,2,3,5,5]);
    framecut.handleFrame(b,c);
    b = new Buffer([6,7,8,9]);
    framecut.handleFrame(b, c);
}
function sendOneDelimFrameInParts(){
    var c = {};
    var b = new Buffer("012345");
    framecut.handleFrame(b, c);
    b = new Buffer("6789\n");
    framecut.handleFrame(b, c);
    b = new Buffer("012345");
    framecut.handleFrame(b, c);
    b = new Buffer("6789\n");
    framecut.handleFrame(b, c);

}
function sendOneDelimFrameSticked(){
    var c = {};
    var b = new Buffer("01234\n0123");
    framecut.handleFrame(b, c);
    b = new Buffer("6789\n");
    framecut.handleFrame(b, c);
}


function test(name, fun, times){
    var started = Date.now();
    var finish = function()
    {
        console.log(name + "\t::: " + Math.round(times / (Date.now() - started) * 1000) + " Messages/second");
    };
    fun(times, finish)
}

function do_times(a, fun){
    for(var i = 0 ; i < a; i++)
    {
        fun()
    }
}
function compareBuffers(a, b){
    return(a.toJSON().toString() == b.toJSON().toString())
}

var onePartTestL = function(cb, old){
    var c = {};
    framecut.initByLength(function(data, client){
        cb(compareBuffers(data, new Buffer([1,1,1,1])))
    }, null, old);
    framecut.handleFrame(new Buffer([4,1,1,1,1]), c);
};
var fewPartsTestL = function(cb, old){
    var c = {};
    framecut.initByLength(function(data, client){
        cb(compareBuffers(data, new Buffer([2,2,2,2,2])))
    },null, old);
    framecut.handleFrame(new Buffer([5,2,2,2,2]), c);
    framecut.handleFrame(new Buffer([2]), c);

};
var stickedTogetherTestL = function(cb, old){
    var c = {};
    var once = false;
    var passedOnce = false;
    framecut.initByLength(function(data, client){
        if(!once){
            passedOnce = compareBuffers(data, new Buffer([3,3]));
            once = true
        } else {
            cb(passedOnce && (compareBuffers(data, new Buffer([4,4,4,4]))))
        }
    }, null, old);
    framecut.handleFrame(new Buffer([2,3,3,4]), c);
    framecut.handleFrame(new Buffer([4,4,4,4]), c);
};
var separationTestL = function(cb)
{
    setTimeout(function(){cb(true)}, 1000);
    framecut.initByLength(function(msg, client){
        cb(false);
    });
    framecut.handleFrame(new Buffer([4,1,2,3]), {});
    framecut.handleFrame(new Buffer([1]), {});
};

var onePartTestD = function(cb){
    var c = {};
    framecut.initByDelimiter(function(word, client){
        cb(word == "abcde");
    }, "\n");
    framecut.handleFrame(new Buffer("abcde\n"), c)
};
var fewPartsTestD = function(cb){
    var c = {};
    framecut.initByDelimiter(function(word, client){
        cb(word == "abcde");
    }, "\n");
    framecut.handleFrame(new Buffer("ab"), c)
    framecut.handleFrame(new Buffer("cde\n"), c)
};
var stickedTogetherTestD = function(cb){
    var c = {};
    var once = false;
    var passedOnce = false;
    framecut.initByDelimiter(function(word, client){
        if(!once){
            passedOnce = word == "abcde";
            once = true
        } else {
            cb(passedOnce && (word == "abcde"));
        }
    }, "\n");
    framecut.handleFrame(new Buffer("abcde\nabcde"), c)
    framecut.handleFrame(new Buffer("\n"), c)
};
var separationTestD = function(cb)
{
    setTimeout(function(){cb(true)}, 1000);
    framecut.initByLength(function(msg, client){
        cb(false);
    });
    framecut.handleFrame(new Buffer("abcd"), {});
    framecut.handleFrame(new Buffer("a\n"), {});
};

onePartTestL         (function(result){console.log("Length: One part test passing: " + result)});
fewPartsTestL        (function(result){console.log("Length: Few parts test passing: " + result)});
stickedTogetherTestL (function(result){console.log("Length: Stick together test passing: " + result)});
separationTestL      (function(result){console.log("Length: Separation test passing: " + result)});
console.log("\n");

onePartTestD         (function(result){console.log("Delimiter: One part test passing : " + result)});
fewPartsTestD        (function(result){console.log("Delimiter: Few parts test passing: " + result)});
stickedTogetherTestD (function(result){console.log("Delimiter: Stick together test passing: " + result)});
separationTestD      (function(result){console.log("Delimiter: Separation test passing: " + result)});
console.log("\n");

//=========================================================================
setTimeout(function()
{
    console.log("\n");

    test("Delimiter in parts", Delim, COUNT);
    test("Delimiter stick   ", Delim2, COUNT);
    test("Length in parts   ", Length, COUNT);
    test("Length stick      ", Length2, COUNT);
}, 3000)



//=========================================================================
