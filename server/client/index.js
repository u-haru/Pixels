import 'https://cdn.socket.io/4.1.3/socket.io.js'

window.onload = function(){
    /**@type {HTMLInputElement} *///@ts-ignore
    const colorinput = document.getElementById("color")
    const colorbox = document.getElementById("colorbox")
    let host = window.document.location.host;
    let ServerAddress = 'ws://' + host;
    //@ts-ignore
    let Socket = io(ServerAddress);

    Socket.on("connect",() => {
        console.log('Socket接続に成功しました');
    });
    
    Socket.on("disconnect",() => {
        console.log(`Socketが閉じられました`);
    });

    Socket.on("error", (err) => {
        console.log(`Socketエラーが発生しました：${err}`);
    });

    Socket.on("colorchanged",arg=>{
        colorinput.value = arg
        colorbox.style.backgroundColor = arg
    })
    console.log(ServerAddress)

    Socket.emit("getcolor",(res)=>{
        colorinput.value = res
        colorbox.style.backgroundColor = res
    })
    colorinput.onchange=()=>{
        Socket.emit("setcolor",colorinput.value)
    }
    colorinput.oninput=()=>{
        colorbox.style.backgroundColor = colorinput.value
    }
}