// Author : Iraasta
// Date : 
//---------------------
// IMPORTS
    
//
//---------------------

var framecut = {};
module.exports = framecut;


var _frameLL = 1;
var _currentFrameLength = 0;
var _cb;
var _delimiter = "|";
var _byLength = true;
var _frame = new Buffer(0);
var _word = "";

framecut.debug = false;

framecut.setLengthsLength = function(val){
    if(val < 0 || val > 4) console.error("Length's length must be between 0 and 4 bytes");
    else
    {
        _frameLL = val;
    }
};
/**
 *
 * @param {Function} cb
 * @param {Number} [frameLengthSize]
 */
framecut.initByLength = function(cb , frameLengthSize){
    _byLength = true;
    _frameLL = frameLengthSize || _frameLL;
    _cb = cb;
} ;
/**
 *
 * @param {Function}  cb
 * @param {String} delimiter
 */
framecut.initByDelimiter = function(cb , delimiter){
    _byLength = false;
    _delimiter = delimiter || delimiter;
    _cb = cb;
} ;

/**
 *
 * @param data
 * @param client
 * @returns {Buffer|String}
 */
framecut.handleFrame = function(data, client)
{
    if(_byLength) return handleFrameL(data,_frame,client);
    else          return handleFrameD(data ,client);
};

function handleFrameL(data, frame, client)
{
    _frame = Buffer.concat([frame,data]);
    console.log(_frame.toJSON());
    if(_frame.length  >= _frameLL && !_currentFrameLength)
    {
        _currentFrameLength = Buffer.concat([new Buffer(new Array(4-_frameLL)),
            _frame.slice(0,_frameLL)],
            4).readInt32BE(0);
        log("Got The Frame Length " + _currentFrameLength);
    }
    if(_currentFrameLength != 0)
    {
        log("Got The Frame Part " + data.toJSON());
        if(_frame.length >= _currentFrameLength + _frameLL)
        {
            var content = _frame.slice(_frameLL,_currentFrameLength + _frameLL);
            log("Got The Whole Frame " + _frame.toJSON());
            log("Got The Whole Content " + content.toJSON());

            _cb(content, client);


            //Reset the data after finishing
            if(content.length+1 < _currentFrameLength + _frameLL)
            {
                _frame = _frame.slice(_currentFrameLength + _frameLL);
                handleFrameL(new Buffer(0),_frame);
            }else{
                _frame =  new Buffer(0);
            }
            _currentFrameLength = 0;
        }
    }
    return _frame;
}

function handleFrameD(data, client)
{
    _word += data.toString();
    //console.log(data);
   // console.log(_word);
    var cake = _word.split(_delimiter);
    var i = cake.length - 1;
    while(--i > -1)
    {
        _cb(cake[i], client);
    }
    _word = cake[cake.length-1];
}

function log(str)
{
    if(framecut.debug) console.log(str);
}