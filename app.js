/**
 * Created by Iraasta on 06.03.14.
 */


//========IMPORTS============
var framecut = require("./framecut");
//==========END==============

var times = 100000;
var dataCB = 0;
var dataCS = 0;
var time = process.uptime();
for(var i = 0 ; i < 5 ; i++)
    handleByte();

function handleByte()
{
    var cb = function()
    {
        counter--;
        if(counter <= 0)
        {
            time = (process.uptime() - time)*1000;
            console.log("Byte: "+ time + "ms");
            console.log((dataCB/1024/128)/(time/1000) + "MBit/s would be a limit\n");
            handleString();
        }
    };
    var time = process.uptime();
    framecut.initByLength(cb, 1);
    framecut.debug = false;
    var i = times;
    var counter = i;
    var someDataB = new Buffer([7,0,1,2,3,4]);
    var someDataB2 = new Buffer([5,6,7]);
    while(i-- > 0)
    {
        framecut.handleFrame(someDataB, null);
        framecut.handleFrame(someDataB2, null);

        dataCB+= 8;
    }
}
function handleString()
{
    var cb = function()
    {
        counter--;

        if(counter <= 0)
        {
            time = (process.uptime() - time)*1000;
            console.log("String: "+ time + "ms");
            console.log((dataCS/1024/128)/(time/1000) + "Mbit/s would be a limit\n");

        }
    };
    //String
    var time = process.uptime();
    framecut.initByDelimiter(cb, "|");
    framecut.debug = false;
    var i = times;
    var counter = i;
    var someDataS = new Buffer("1234");
    var someDataS2 = new Buffer("56|");
    while(i-- > 0)
    {
        framecut.handleFrame(someDataS, null);
        framecut.handleFrame(someDataS2, null);
        dataCS+=8;
    }
}