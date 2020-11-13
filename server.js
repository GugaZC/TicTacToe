const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 }, function () {
    console.log('server on');
});

let socketsConnected = [];

wss.on('connection', ws => {
    const Player = {
        id:`${Math.round(Math.random()*10000)}`,
        name:`Player${socketsConnected.length + 1}`,
        status: "available",
    }

    ws.Player = Player
    socketsConnected.push(ws);

    ws.on('message', data => {

        // data = {
        //     action: string,  ação que deve ser feita
        //     cellId?: string  id da celula que foi clicada
        //     symbol?: string  símbolo que deve ser inserido 
        //     player1Id?:
        //     player2Id?:
        //     challengedPlayerId?: se for mensagem pra desafio terá o id do player que é desafiado
        // }

        const {action, challengedPlayerId} = JSON.parse(data);
        
        const senderId = ws.Player.id;

        switch (action) {
            case "updateCell":
                console.log("updatecell");
                break;

            case "getPlayers":
                sendUsersConnected();
                break;

            case "setUsername":
                console.log("setUsername");
                break;

            case "challengePlayer":
                if(challengedPlayerId === senderId){
                    const data = {
                        action:"selfChallenge"
                    }
                    ws.send(JSON.stringify(data))
                    break;
                }
                challengePlayer(challengedPlayerId, senderId);
                break;
            default:
                break;
        }

    });

    ws.on('close', function connectionLost(element) {

        const index = socketsConnected.indexOf(ws);
        socketsConnected.splice(index, 1);

    })
});

const sendUsersConnected = () => {
    let data = {
        action: "updateUsersStatus",
        users:{
            available:[],
        }
    };

    socketsConnected.forEach((socket, index) => {
        data.users.available.push(socket.Player)
    });
    socketsConnected.forEach((socket)=>{
        socket.send(JSON.stringify(data))
    })
}

const challengePlayer = (challengedId, challengerId) => {

    const challenged = socketsConnected.filter(socket => socket.Player.id === challengedId)[0]

    const challenger = socketsConnected.filter(socket => socket.Player.id === challengerId)[0]

    if(challenged.Player.status != "available"){
        const data ={
            action: "playerNotAvailable"
        }
        challenger.send(JSON.stringify(data))
        return
    }

    const data = {
        action: "acceptChallenge", 
        player: challenger.Player.name
    }

    challenged.send(JSON.stringify(data))
}