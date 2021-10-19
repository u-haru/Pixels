'use strict';

const host = "http://nitmc.com/"
const dest = "192.168.86.255"
const destport = 1234

const Dgram = require('dgram');
const SocketIO = require("socket.io-client")

let udpemitter = Dgram.createSocket("udp4");

let socket = SocketIO.io(host,{path:"/LED/socket.io"})

socket.on("setcolor",str=>{
    let r = parseInt(str.substr( 1, 2 ), 16);
    let g = parseInt(str.substr( 3, 2 ), 16);
    let b = parseInt(str.substr( 5, 2 ), 16);
    // console.log(r,g,b)
    let array = Buffer.from([r,g,b])

    udpemitter.send(array, 0, array.length, destport, dest);
})
socket.on("connect",()=>{
    console.log("connected")
    socket.emit("controller")
})