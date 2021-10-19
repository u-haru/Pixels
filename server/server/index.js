'use strict';

const port = 28686

const SocketIO = require("socket.io")

class C2{
    constructor(httpServer){
        /** @type {SocketIO.Server} - socketio */
        this.io = new SocketIO.Server(httpServer,{serveClient: true});
        this.controllerid = ""
        this.color = "#FFFFFF"
        this.io.on("connection", socket => {
            socket.on("controller", () => {
                this.controllerid = socket.id
                // console.log("new controller: "+this.controllerid)
            });
            socket.on("setcolor", arg => {
                this.color = arg
                this.io.to(this.controllerid).emit("setcolor",arg)
                socket.broadcast.emit("colorchanged",arg)
                // console.log("set color: "+arg)
            });
            socket.on("getcolor", ack => {
                if(typeof ack == "function") ack(this.color)
            });
        });
    }
}

const httpa = require('http');
const express = require('express');//サーバー
const app = express();
app.use("/", express.static('client'));//clientを返す

const httpServer = httpa.createServer(app);
new C2(httpServer)

httpServer.listen(port, () => {
    console.log(`listening on ${port}`)
})
