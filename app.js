/**
 * Created by Iraasta on 06.03.14.
 */


//========IMPORTS============
var net = require("net");
var framecut = require("./framecut");
//==========END==============

framecut.initByDelimiter(handleData, "|");
framecut.debug = true;

net.createServer(function(socket){
    socket.on("data", function(data){
        framecut.handleFrame(data,socket);
    })
} ).listen(1908);

function handleData(content, client)
{
    console.log(content);
}