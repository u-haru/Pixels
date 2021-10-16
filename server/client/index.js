import 'https://cdn.socket.io/4.1.3/socket.io.js'

let hsv = {
    h:0,
    s:0,
    v:0
}
let Socket

window.onload = function(){
    const colorbox = document.getElementById("colorbox")
    const picker = document.getElementById("picker")
    const pointer = document.getElementById("pointer")
    const hue = document.getElementById("hue")
    const slider = document.getElementById("slider")

    let host = window.document.location.host;
    let ServerAddress = 'ws://' + host;
    //@ts-ignore
    Socket = io(ServerAddress);

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
        hsv = hexToHsv(arg)
        setPointers(hsv)
    })

    Socket.emit("getcolor",res=>{
        hsv = hexToHsv(res)
        setPointers(hsv)
    })
    setPointer(pointer,picker)
    setSlider(slider,hue,colorbox)
}

function setPointer(pointer,parent){
    const mdown = (e) => {
        let event = e;
        //タッチデイベントとマウスのイベントの差異を吸収
        if (e.type !== "mousedown") {
            event = e.changedTouches[0];
        }
        
        let y = round(event.pageY - parent.offsetTop,0,parent.clientHeight)
        let x = round(event.pageX - parent.offsetLeft,0,parent.clientWidth)
        pointer.style.top = y + "px";
        pointer.style.left = x + "px";
        //ムーブイベントにコールバック
        document.addEventListener("mousemove", mmove, { passive: false });
        document.addEventListener("touchmove", mmove, { passive: false });

        document.addEventListener("mouseup", mup, { passive: true });
        document.addEventListener("touchend", mup, { passive: true });

        hsv.s = x / parent.clientWidth
        hsv.v = 1 - y / parent.clientHeight
        setColor(hsv)
    }
    //マウスカーソルが動いたときに発火
    const mmove = (e) => {
        let event = e;
        if (e.type !== "mousemove") {
            event = e.changedTouches[0];
        }
        //フリックしたときに画面を動かさないようにデフォルト動作を抑制
        e.preventDefault();
        let y = round(event.pageY - parent.offsetTop,0,parent.clientHeight)
        let x = round(event.pageX - parent.offsetLeft,0,parent.clientWidth)
        pointer.style.top = y + "px";
        pointer.style.left = x + "px";
        hsv.s = x / parent.clientWidth
        hsv.v = 1 - y / parent.clientHeight
        setColor(hsv)
    }
    //マウスボタンが上がったら発火
    const mup = (e) => {
        //ムーブベントハンドラの消去
        document.removeEventListener("mousemove", mmove, false);
        document.removeEventListener("touchmove", mmove, false);
        document.removeEventListener("mouseup", mup, false);
        document.removeEventListener("touchend", mup, false);
        sendColor(hsv)
    }
    
    parent.addEventListener("mousedown", mdown, { passive: true });
    parent.addEventListener("touchstart", mdown, { passive: true });
}

function setSlider(pointer,parent,colorbox){
    const mdown = (e) => {
        let event = e;
        //タッチデイベントとマウスのイベントの差異を吸収
        if (e.type !== "mousedown") {
            event = e.changedTouches[0];
        }
        
        let x = round(event.pageX - parent.offsetLeft,0,parent.clientWidth)
        pointer.style.left = x + "px";
        //ムーブイベントにコールバック
        document.addEventListener("mousemove", mmove, { passive: false });
        document.addEventListener("touchmove", mmove, { passive: false });

        document.addEventListener("mouseup", mup, { passive: true });
        document.addEventListener("touchend", mup, { passive: true });

        hsv.h = x / parent.clientWidth * 360
        setColor(hsv)
    }
    //マウスカーソルが動いたときに発火
    const mmove = (e) => {
        let event = e;
        if (e.type !== "mousemove") {
            event = e.changedTouches[0];
        }
        //フリックしたときに画面を動かさないようにデフォルト動作を抑制
        e.preventDefault();
        let x = round(event.pageX - parent.offsetLeft,0,parent.clientWidth)
        pointer.style.left = x + "px";
        hsv.h = x / parent.clientWidth * 360
        setColor(hsv)
    }
    //マウスボタンが上がったら発火
    const mup = (e) => {
        //ムーブベントハンドラの消去
        document.removeEventListener("mousemove", mmove, false);
        document.removeEventListener("touchmove", mmove, false);
        document.removeEventListener("mouseup", mup, false);
        document.removeEventListener("touchend", mup, false);
        sendColor(hsv)
    }
    
    parent.addEventListener("mousedown", mdown, { passive: true });
    parent.addEventListener("touchstart", mdown, { passive: true });
}

function hsvToHex(H,S,V){
    var C = V * S;
    var Hp = H / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));

    var R, G, B;
    if (Hp < 1) {[R,G,B]=[C,X,0]}
    else if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]}
    else if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]}
    else if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]}
    else if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]}
    else if (5 <= Hp) {[R,G,B]=[C,0,X]}

    var m = V - C;
    [R, G, B] = [R+m, G+m, B+m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);

    return "#" + [R ,G, B].map( function ( value ) {return ( "0" + value.toString( 16 ) ).slice( -2 ) ;}).join("");
}

function hexToHsv(hex){
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16)/ 255;
    let g = parseInt(result[2], 16)/ 255;
    let b = parseInt(result[3], 16)/ 255;
    let max = Math.max( r, g, b ) ;
	let min = Math.min( r, g, b ) ;
	let diff = max - min ;

	let h = 0 ;
	switch( min ) {
		case max :
			h = 0 ;
		    break ;
		case r :
			h = (60 * ((b - g) / diff)) + 180 ;
		    break ;
		case g :
			h = (60 * ((r - b) / diff)) + 300 ;
		    break ;
		case b :
			h = (60 * ((g - r) / diff)) + 60 ;
		    break ;
	}
	let s = max == 0 ? 0 : diff / max ;
	let v = max ;
	return {h:h,s:s,v:v}
}

function setPointers(hsv){
    const pointer = document.getElementById("pointer")
    const slider = document.getElementById("slider")
    
    pointer.style.left = hsv.s * 100 + "%"
    pointer.style.top = (1 - hsv.v) * 100 + "%"
    slider.style.left = hsv.h/360 * 100 + "%"
    setColor(hsv)
}

function setColor(hsv){
    const colorbox = document.getElementById("colorbox")
    const picker = document.getElementById("picker")
    
    picker.style.backgroundColor = hsvToHex(hsv.h,1,1)
    colorbox.style.backgroundColor = hsvToHex(hsv.h, hsv.s, hsv.v)
}

function sendColor(hsv){
    Socket.emit("setcolor",hsvToHex(hsv.h, hsv.s, hsv.v))
}

function round(num,min,max){
    if(num < min) return min
    else if(num > max) return max
    else return num
}