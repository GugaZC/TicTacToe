const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 }, function () {
    console.log("server on");
});

let socketsConnected = [];
let games = [];
const TIMEOUT = 10000;

wss.on("connection", (ws) => {
    const Player = {
        id: `${Math.round(Math.random() * 10000)}`,
        name: `Player${socketsConnected.length + 1}`,
        status: "available",
        // connectedAt: Date.now()
    };

    ws.Player = Player;
    socketsConnected.push(ws);

    ws.on("message", (data) => {
        // data = {
        //     action: string,  ação que deve ser feita
        //     cellId?: string  id da celula que foi clicada
        //     symbol?: string  símbolo que deve ser inserido
        //     player1Id?:
        //     player2Id?:
        //     challengedPlayerId?: se for mensagem pra desafio terá o id do player que é desafiado
        // }

        const {
            action,
            challengedPlayerId,
            player1,
            player2,
            player,
            cellId,
            boardId,
        } = JSON.parse(data);

        const senderId = ws.Player.id;

        switch (action) {
            case "updateCell":
                updateCell(cellId, boardId);
                break;

            case "getPlayers":
                sendUsersConnected();
                break;

            case "setUsername":
                console.log("setUsername");
                break;

            case "challengePlayer":
                if (challengedPlayerId === senderId) {
                    const data = {
                        action: "selfChallenge",
                    };
                    ws.send(JSON.stringify(data));
                    break;
                }
                challengePlayer(challengedPlayerId, senderId);
                break;
            case "createGame":
                createGame(player1, player2);
                break;

            case "refuseChallenge":
                const data = {
                    action: "challengeRefused",
                };
                const Player = socketsConnected.filter(
                    (socket) => socket.Player.id === player
                )[0];

                Player.send(JSON.stringify(data));
                break;
            default:
                break;
        }
    });

    ws.on("close", (element) => {
        const index = socketsConnected.indexOf(ws);
        socketsConnected.splice(index, 1);
    });
});
const sendUsersConnected = () => {
    let data = {
        action: "updateUsersStatus",
        users: {
            available: [],
        },
    };

    // ws.on('played', function (data) {
    //     var game;
    //     for (var i = 0; i < games.length; i++) {
    //         if (games[i].id == data.room) {
    //             game = games[i];
    //         }
    //     }

    socketsConnected.forEach((socket) => {
        data.users.available.push(socket.Player);
    });
    socketsConnected.forEach((socket) => {
        socket.send(JSON.stringify(data));
    });
};

const challengePlayer = (challengedId, challengerId) => {
    const challenged = socketsConnected.filter(
        (socket) => socket.Player.id === challengedId
    )[0];

    const challenger = socketsConnected.filter(
        (socket) => socket.Player.id === challengerId
    )[0];

    if (challenged.Player.status != "available") {
        const data = {
            action: "playerNotAvailable",
        };
        challenger.send(JSON.stringify(data));
        return;
    }

    const data = {
        action: "acceptChallenge",
        player1: {
            name: challenger.Player.name,
            id: challenger.Player.id,
        },
        player2: {
            id: challenged.Player.id,
        },
    };

    challenged.send(JSON.stringify(data));
};

const createGame = (player1, player2) => {
    const newGame = {
        id: `${games.length + 1}`,
        player1Id: player1,
        player2Id: player2,
        isPlayer1sTurn: true,
    };
    games.push(newGame);

    const Player1 = socketsConnected.filter(
        (socket) => socket.Player.id === player1
    )[0];

    const Player2 = socketsConnected.filter(
        (socket) => socket.Player.id === player2
    )[0];

    const data = {
        action: "enterGame",
        game: {
            id: newGame.id,
        },
    };
    Player1.Player.status = "inGame";
    Player2.Player.status = "inGame";

    sendUsersConnected();

    Player1.send(JSON.stringify(data));
    Player2.send(JSON.stringify(data));
};

const updateCell = (cellId, boardId) => {
    const board = games.filter((game) => game.id === boardId)[0];

    const Player1 = socketsConnected.filter(
        (socket) => socket.Player.id === board.player1Id
    )[0];

    const Player2 = socketsConnected.filter(
        (socket) => socket.Player.id === board.player2Id
    )[0];

    const data = {
        action: "updateGame",
        cellId,
        isPlayer1sTurn: board.isPlayer1sTurn,
    };

    games.filter(
        (game) => game.id === boardId
    )[0].isPlayer1sTurn = !board.isPlayer1sTurn;
    Player1.send(JSON.stringify(data));
    Player2.send(JSON.stringify(data));
};

const periodic = () => {
    let actualTime = Date.now();

    let x = 0;

    while (x < socketsConnected.lenght) {
        if (
            socketsConnected[x].validate == false &&
            actualTime - socketsConnected[x].timestamp > TIMEOUT
        ) {
            console.log("User removido dos ativos");

            let MSG = { tipo: "ERRO", valor: "timeout" };
            socketsConnected[x].close();
            socketsConnected.splice(x, 1);
        } else x++;
    }
};
