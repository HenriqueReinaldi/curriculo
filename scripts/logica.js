
const canva = document.getElementById("lcanva");
const lreset = document.getElementById("lreset")
const lluz = document.getElementById("lluz")
const lbotao  = document.getElementById("lbotao")
const land = document.getElementById("land")
const lnot = document.getElementById("lnot")
const lxor = document.getElementById("lxor")
const lor = document.getElementById("lor")

const width = 1500;
const height = 750;
const cl = canva.offsetLeft + canva.clientLeft;
const ct = canva.offsetTop + canva.clientTop;
const logica_ctx = canva.getContext("2d");

var box_size = 90;
var pin_size = 30;

var mouse_x = 0;
var mouse_y = 0;
var mouse_held = false;

var portoes = [];
var portao_carregando = null;
var pino_conectando = null;

function update_portao_pin_coords(portao){
    px = portao["x"];
    py = portao["y"];
    inputs = portao["in"];
    outputs = portao["out"];

    let offset = 0;
    if (inputs.length == 0) {}
    else if (inputs.length == 1) {
        inputs[0]["x"] = px-pin_size;
        inputs[0]["y"] = py+pin_size;
    }
    else{
        for (let i = 0; i < inputs.length; i++){
            inputs[i]["x"] = px-pin_size;
            inputs[i]["y"] = py+offset;
            offset += pin_size*2;
        }
    }

    offset = 0;
    if (outputs.length == 0) {}
    else if (outputs.length == 1) {
        outputs[0]["x"] = px+box_size;
        outputs[0]["y"] = py+pin_size;
    }
    else{
        for (let i = 0; i < outputs.length; i++){
            outputs[i]["x"] = px+box_size;
            outputs[i]["y"] = py+offset;
            offset += pin_size*2;;
        }
    }

}

function draw_wire(x, y, dx, dy, active){
    logica_ctx.beginPath();
    logica_ctx.moveTo(x, y)
    logica_ctx.lineTo(dx, dy)

    if (active) logica_ctx.strokeStyle = "#90f5fc"
    else logica_ctx.strokeStyle = "#b6b6b6"
    
    logica_ctx.lineWidth = 5
    logica_ctx.stroke()
}

function draw_portao(portao){
    //portao em si
    logica_ctx.fillStyle = "#000000";
    if (portao["type"] == "luz"){
        if (portao["in"][0]["status"]) logica_ctx.fillStyle = "#ffd91d";
    }

    logica_ctx.fillRect(portao["x"], portao["y"], box_size, box_size);
    logica_ctx.fillStyle = "#FFFFFF";
    logica_ctx.textAlign = "center";
    logica_ctx.textBaseline = "middle";
    cx = portao["x"] + (box_size / 2);
    cy = portao["y"] + (box_size / 2);
    logica_ctx.font = "bold 23px Arial";
    logica_ctx.fillText(portao["type"].toUpperCase(), cx, cy);
    logica_ctx.fillStyle = "#676767";


    update_portao_pin_coords(portao);
    for (let i = 0; i < portao["in"].length; i++){
        logica_ctx.fillRect(portao["in"][i]["x"], portao["in"][i]["y"], pin_size, pin_size);
    }
    for (let i = 0; i < portao["out"].length; i++){
        logica_ctx.fillRect(portao["out"][i]["x"], portao["out"][i]["y"], pin_size, pin_size);
    }

    //fios
    pinos = [...inputs, ...outputs]
    for (let i = 0; i < pinos.length; i++){
        let p = pinos[i];
        if (p != pino_conectando) continue;
        x = p["x"] + pin_size/2 
        y = p["y"] + pin_size/2
        draw_wire(x,y,mouse_x,mouse_y);
    }
}



function gloop(){

    for (let i = 0; i < portoes.length; i++){
        portao = portoes[i];
        inp = portao["in"]

        for (let j = 0; j < inp.length; j++){
            inp[j]["status"] = false;
        }
    }

    for (let i = 0; i < portoes.length; i++){
        portao = portoes[i];
        out = portao["out"]
        if (out.length <= 0) continue;

        for (let j = 0; j < out[0]["conn"].length; j++){
            if (!out[0]["conn"][j]["status"]){
                out[0]["conn"][j]["status"] = out[0]["status"] 
            }
        }
    }

    for (let i = 0; i < portoes.length; i++){
        portao = portoes[i];
        inp = portao["in"]
        out = portao["out"]

        switch (portao["type"]) {
            case "and":
                out[0]["status"] = inp[0]["status"] && inp[1]["status"]
                break;
            case "or":
                out[0]["status"] = inp[0]["status"] || inp[1]["status"]
                break;
            case "not":
                out[0]["status"] = !inp[0]["status"]
                break;
            case "xor":
                out[0]["status"] = !!inp[0]["status"] !== !!inp[1]["status"]
                break;
            default:
                break;
        }



    }

    //DESENHAR TUDO
    logica_ctx.reset();
    //desenhar portao
    for (let i = 0; i < portoes.length; i++){
        draw_portao(portoes[i]);
    }
    //desenhar fio
    for (let i = 0; i < portoes.length; i++){
        portao = portoes[i];
        pinos = [...portao["in"], ...portao["out"]];

        for (let i = 0; i < pinos.length; i++){
            let p = pinos[i];

            for (let j = 0; j < p["conn"].length; j++){
                x = p["x"] + pin_size/2 
                y = p["y"] + pin_size/2
                dx = p["conn"][j]["x"] + pin_size/2 
                dy = p["conn"][j]["y"] + pin_size/2 

                draw_wire(x,y,dx,dy, p["status"]);
            }
        }
    }
}
setInterval(gloop, 0);



function update_ponteiro_pos(e){
    const rect = canva.getBoundingClientRect();
    mouse_x = (e.clientX - rect.left) * (canva.width / rect.width);
    mouse_y = (e.clientY - rect.top) * (canva.height / rect.height);


    // const size = 10;
    // logica_ctx.fillStyle = "red";
    // logica_ctx.fillRect(mouse_x - size / 2, mouse_y - size / 2, size, size);

    if (mouse_held){
        if (portao_carregando){
            portao_carregando["x"] = mouse_x-box_size/2;
            portao_carregando["y"] = mouse_y-box_size/2 ;
        }
    }
}
canva.addEventListener("pointermove", e => update_ponteiro_pos(e));


function ponteiro_click(){
    mouse_held = true;

    for (let i = 0; i < portoes.length; i++){
        p = portoes[i];

        if (mouse_x >= p["x"] && mouse_x <= p["x"]+box_size && mouse_y >= p["y"] && mouse_y <= p["y"]+box_size){
            if (p["type"] == "botao"){
                p["out"][0]["status"] = !p["out"][0]["status"]
            }
            portao_carregando = p;
            break;
        }

        update_portao_pin_coords(p);
        pinos = [...p["in"], ...p["out"]]

        for (let j = 0; j < pinos.length; j++){
            d = pinos[j];
            if (mouse_x >= d["x"] && mouse_x <= d["x"]+pin_size && mouse_y >= d["y"] && mouse_y <= d["y"]+pin_size){
                pino_conectando = d;
                break;
            }
        }

    }
}
canva.addEventListener("pointerdown", e => ponteiro_click())

function ponteiro_unclick(){
    mouse_held = false;

    if (pino_conectando){
        for (let i = 0; i < portoes.length; i++){
            p = portoes[i];
            update_portao_pin_coords(p);
            pinos = [...p["in"], ...p["out"]]

            for (let j = 0; j < pinos.length; j++){
                d = pinos[j];
                if (d == pino_conectando) continue;
                if (pino_conectando["type"] == d["type"]) continue;
                if (!(mouse_x >= d["x"] && mouse_x <= d["x"]+pin_size && mouse_y >= d["y"] && mouse_y <= d["y"]+pin_size)) continue;

                if (pino_conectando["type"] == ["in"]){
                    if (!d["conn"].includes(pino_conectando)) d["conn"].push(pino_conectando)
                }
                else{
                    if (!pino_conectando["conn"].includes(d)) pino_conectando["conn"].push(d)
                }
                
                break;
            }
        }
    }

    portao_carregando = null;
    pino_conectando = null;
}
canva.addEventListener("pointerup", e => ponteiro_unclick());



function push_onezero(type,x,y){
    portoes.push({
        "type": type,
        "x": x,
        "y": y,
        "in": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "in"
            },
        ],
        "out": [
        ]
    })
}
function push_zeroone(type,x,y){
    portoes.push({
        "type": type,
        "x": x,
        "y": y,
        "in": [
        ],
        "out": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "out"
            },
        ]
    })
}
function push_twoone(type,x,y){
    portoes.push({
        "type": type,
        "x": x,
        "y": y,
        "in": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "in"
            },
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "in"
            },
        ],
        "out": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "out"

            },
        ]
    })
}
function push_oneone(type, x, y){
    portoes.push({
        "type": type,
        "x": x,
        "y": y,
        "in": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "in"

            },
        ],
        "out": [
            {
                "x": 0,
                "y": 0,
                "status": false,
                "conn": [],
                "type": "out"
            },
        ]
    })
}   

var kp = {};
window.addEventListener("keydown", (e) => {
    kp[e.key] = true;

    if (kp["a"]) push_twoone("and", mouse_x, mouse_y);
    if (kp["x"]) push_twoone("xor", mouse_x, mouse_y);
    if (kp["o"]) push_twoone("or", mouse_x, mouse_y);
    if (kp["n"]) push_oneone("not", mouse_x, mouse_y);
    if (kp["b"]) push_zeroone("botao", mouse_x, mouse_y);
    if (kp["l"]) push_onezero("luz", mouse_x, mouse_y);

        
    if(kp["r"] && kp["u"]){
        portoes = []
    }
});
window.addEventListener("keyup", (e) => {
    kp[e.key] = false;
});

lreset.addEventListener("click", () => {
    portoes = []
})
lluz.addEventListener("click", () => {
    push_onezero("luz", 100, 100);
})
lbotao.addEventListener("click", () => {
    push_zeroone("botao", 100,100);
})
land.addEventListener("click", () => {
    push_twoone("and", 100, 100);
})
lnot.addEventListener("click", () => {
    push_oneone("not", 100, 100);
})
lxor.addEventListener("click", () => {
    push_twoone("xor", 100, 100);
})
lor.addEventListener("click", () => {
    push_twoone("or", 100, 100);
})