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
        status: "notLogged",
        // connectedAt: Date.now()
    };

    ws.Player = Player;
    socketsConnected.push(ws);
    ws.send(JSON.stringify({ action: "getName", playerId: Player.id }));

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
            username,
            playerId,
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
                setUsername(username, playerId);
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

const setUsername = (username, playerId) => {
    socketsConnected.filter(
        (socket) => socket.Player.id === playerId
    )[0].Player.name = username;
    socketsConnected.filter(
        (socket) => socket.Player.id === playerId
    )[0].Player.status = "available";

    sendUsersConnected();
};

const sendUsersConnected = () => {
    let data = {
        action: "updateUsersStatus",
        users: {
            available: [],
        },
    };

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
        game: [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
        ],
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
        disable: false,
        game: {
            id: newGame.id,
        },
    };
    const data2 = {
        action: "enterGame",
        disable: true,
        game: {
            id: newGame.id,
        },
    };
    Player1.Player.status = "inGame";
    Player2.Player.status = "inGame";

    sendUsersConnected();

    Player1.send(JSON.stringify(data));
    Player2.send(JSON.stringify(data2));
};

const getCol = (matrix, col) => {
    var column = [];
    for (var i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col]);
    }
    return column;
};

const getMainDiagonal = (matrix) => {
    var diagonal = [];
    for (var i = 0; i < matrix.length; i++) {
        diagonal.push(matrix[i][i]);
    }
    return diagonal;
};

const getSecondDiagonal = (matrix) => {
    var diagonal = [];
    for (var i = 0; i < matrix.length; i++) {
        diagonal.push(matrix[i][matrix.length - i - 1]);
    }
    return diagonal;
};

const checkWin = (arr) => {
    var i;
    var j;

    for (i = 0; i < arr.length; i++) {
        var row = arr[i];
        if (row[0] == row[1] && row[1] == row[2] && row[2] == row[0]) {
            return true;
        }
    }
    var k = 0;
    for (i = 0; i < arr.length; i++) {
        var column = getCol(arr, i);
        if (column[0] == column[1] && column[1] == column[2]) {
            return true;
        }
    }
    diagonal = getMainDiagonal(arr);
    if (diagonal[0] == diagonal[1] && diagonal[1] == diagonal[2]) {
        return true;
    }
    secondDiagonal = getSecondDiagonal(arr);
    if (
        secondDiagonal[0] == secondDiagonal[1] &&
        secondDiagonal[1] == secondDiagonal[2]
    ) {
        return true;
    }
    return false;
};

const updateCell = (cellId, boardId) => {
    const board = games.filter((game) => game.id === boardId)[0];
    const turn = board.isPlayer1sTurn;
    let aux = [];
    aux = cellId.split("");

    if (board.isPlayer1sTurn) {
        board.game[aux[4]][aux[5]] = "X";
    } else {
        board.game[aux[4]][aux[5]] = "O";
    }

    const Player1 = socketsConnected.filter(
        (socket) => socket.Player.id === board.player1Id
    )[0];

    const Player2 = socketsConnected.filter(
        (socket) => socket.Player.id === board.player2Id
    )[0];

    games.filter(
        (game) => game.id === boardId
    )[0].isPlayer1sTurn = !board.isPlayer1sTurn;

    const data = {
        action: "updateGame",
        cellId,
        isPlayer1sTurn: board.isPlayer1sTurn,
        isYourTurn: true,
    };

    const data2 = {
        action: "updateGame",
        cellId,
        isPlayer1sTurn: board.isPlayer1sTurn,
        isYourTurn: false,
    };

    if (board.isPlayer1sTurn) {
        Player1.send(JSON.stringify(data));
        Player2.send(JSON.stringify(data2));
    } else {
        Player1.send(JSON.stringify(data2));
        Player2.send(JSON.stringify(data));
    }

    setTimeout(() => {
        if (checkWin(board.game)) {
            if (turn) {
                const data = {
                    action: "informWin",
                    playerName: `${Player1.Player.name}`,
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: false,
                    boardId: board.id,
                };
                const data2 = {
                    action: "informWin",
                    playerName: `${Player1.Player.name}`,
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: true,
                    boardId: board.id,
                };
                Player1.send(JSON.stringify(data2));
                Player2.send(JSON.stringify(data));
            } else {
                const data2 = {
                    action: "informWin",
                    playerName: `${Player2.Player.name}`,
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: false,
                    boardId: board.id,
                };
                const data = {
                    action: "informWin",
                    playerName: `${Player2.Player.name}`,
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: true,
                    boardId: board.id,
                };
                Player1.send(JSON.stringify(data));
                Player2.send(JSON.stringify(data2));
            }

            Player1.Player.status = "available";
            Player2.Player.status = "available";
            sendUsersConnected();
        } else {
            let counter = 0;
            board.game.map((item) =>
                item.map((element) =>
                    element === "X" || element === "O" ? null : counter++
                )
            );
            if (counter === 0) {
                const data1 = {
                    action: "gaveOldWoman",
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: true,
                    boardId: board.id,
                };
                const data2 = {
                    action: "gaveOldWoman",
                    player1Id: Player1.Player.id,
                    player2Id: Player2.Player.id,
                    isPlayer1: false,
                    boardId: board.id,
                };
                Player1.send(JSON.stringify(data1));
                Player2.send(JSON.stringify(data2));
                Player1.Player.status = "available";
                Player2.Player.status = "available";
                sendUsersConnected();
            }
        }
    }, 200);
};
