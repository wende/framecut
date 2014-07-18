// Author : Iraasta
// Date : 
//---------------------
// IMPORTS
    
//
//---------------------

var framecut = {};
module.exports = framecut;


var _frameLL = 1;
var _cb;
var _delimiter = "|";
var _byLength = true;

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
framecut.initByLength = function(cb , frameLengthSize, old){
    _byLength = true;
    _frameLL = frameLengthSize || _frameLL;
    _cb = cb;
    if(old)framecut.handleFrame = function(data, client)
    {
        return handleFrameL_OLD(data, new Buffer(0) ,client);
    };
    else framecut.handleFrame = function(data, client)
    {
        return handleFrameL(data , client);
    }
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
    framecut.handleFrame = function(data, client)
    {
        return handleFrameD(data ,client);
    }
} ;

/**
 *
 * @param data
 * @param client
 * @returns {Buffer|String}
 */
framecut.handleFrame = function(data, client){return null};



function handleFrameL_OLD(data, frame, client){
    if(client._currentFrameLength == null) client._currentFrameLength = 0;
    client._frame = Buffer.concat([frame,data]);
    if(client._frame.length  >= _frameLL && !client._currentFrameLength)
    {
        client._currentFrameLength = Buffer.concat([new Buffer(new Array(4-_frameLL)),
            client._frame.slice(0,_frameLL)],
            4).readUInt32BE(0);
    }
    if(client._currentFrameLength != 0)
    {
        if(client._frame.length >= client._currentFrameLength + _frameLL)
        {
            var content = client._frame.slice(_frameLL,client._currentFrameLength + _frameLL);
            _cb(content, client);

            //Reset the data after finishing
            if(content.length+1 < client._currentFrameLength + _frameLL)
            {
                client._frame = client._frame.slice(client._currentFrameLength + _frameLL);
                handleFrameL(new Buffer(0),client._frame);
            }else{
                client._frame =  new Buffer(0);
            }
            client._currentFrameLength = 0;
        }
    }
    return client._frame;
}

function handleFrameD(data, client)
{
    if(!client._word) client._word = "";
    client._word += data.toString();
    client._cake = client._word.split(_delimiter);
    client._last = client._cake.length - 1;
    var i = client._last;
    while(--i > -1)
    {
        _cb(client._cake[i], client);
    }
    client._word = client._cake[client._last];
}

/**
 *
 * @param {Buffer} data
 * @param client
 */
function handleFrameL(data, client) {
    if(data.length == 0) return;
    var len = client._actualLength;
    if (!len) {
        len = data.readUInt8(0);
        client._actualLength = len;
        client._msg = new Buffer(len);
        data = data.slice(1);
    }

    var msg = client._msg;
    var written = client._written ? client._written : 0;

    var l = Math.min(data.length, len - written);
    for (var i = 0; i < l; i++)
    {
        msg[written + i] = data[i];
    }
    written += i;
    if(written === len)
    {
        _cb(msg, client);
        client._actualLength = 0;
        client._written = 0;
    }
    else {
        if (!client._written) client._written = 0;
        client._written += written;
        client._msg = msg;
    }
    handleFrameL( data.slice(i), client)
}