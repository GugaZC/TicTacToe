let socket;
let counter = 0;
const connectToServer = (url) => {
    socket = new WebSocket(url);

    socket.onopen = () => {
        const data = {
            action: "getPlayers",
        };
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = (event) => {
        const dataReceived = JSON.parse(event.data);
        switch (dataReceived.action) {
            case "updateUsersStatus":
                updateUsers(dataReceived.users);
                break;

            case "selfChallenge":
                alert("Você não pode se desafiar");
                break;

            case "playerNotAvailable":
                alert("Esse player não está disponível");
                break;

            case "acceptChallenge":
                handleChallenge(dataReceived.player1, dataReceived.player2);
                break;

            case "enterGame":
                enterGame(dataReceived.game.id, dataReceived.disable);
                break;

            case "challengeRefused":
                alert("Seu desafio foi recusado");
                document.getElementById("lobby-screen").classList.remove("hi");
                break;
            case "updateGame":
                updateGame(
                    dataReceived.cellId,
                    dataReceived.isPlayer1sTurn,
                    dataReceived.isYourTurn
                );
                break;

            case "getName":
                setUserName(dataReceived.playerId);
                break;
            case "informWin":
                informWinner(
                    dataReceived.player1Id,
                    dataReceived.player2Id,
                    dataReceived.isPlayer1,
                    dataReceived.boardId,
                    dataReceived.playerName
                );
                break;
            case "gaveOldWoman":
                informOldWoman(
                    dataReceived.player1Id,
                    dataReceived.player2Id,
                    dataReceived.isPlayer1,
                    dataReceived.boardId
                );
                break;
            default:
                break;
        }
    };
};

const setUserName = (playerId) => {
    const getUsername = document.getElementById("get-username");

    content = `<div class="row justify-content-md-center"> 
                    <div class="col-6 ">  
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="nameInput" placeholder="Digite seu nickname" aria-label="Recipient's username" aria-describedby="button-addon2">
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" type="button" id="nameButton">Salvar</button>
                            </div>
                        </div>
                    </div> 
              </div>`;

    getUsername.innerHTML = content;
    button = document.getElementById("nameButton");
    // username = input.value;
    input = document.getElementById("nameInput");
    // getUsername.innerHTML = username;

    // input.type = "text";
    // getUsername.innerHTML = button;

    // button.innerHTML = "Salvar";

    button.addEventListener("click", (event) => {
        username = input.value;
        if (username) {
            sendUsername(username, playerId);
            getUsername.className = `${getUsername.className} hidden`;
        } else alert("Digite um nome");
    });

    input.addEventListener("keyup", (event) => {
        if (event.keyCode == 13) {
            username = input.value;
            if (username) sendUsername(username, playerId);
            else alert("Digite um nome");
            getUsername.className = `${getUsername.className} hidden`;
        }
    });
};

const sendUsername = (username, playerId) => {
    data = {
        action: "setUsername",
        username,
        playerId: playerId,
    };
    socket.send(JSON.stringify(data));
    document.getElementById("lobby-screen").classList.remove("hidden");
};

const informOldWoman = (player1Id, player2Id, isPlayer1, boardId) => {
    disableCells();
    alert("GaveOldWoman (pt_br: deu velha)");
    const popup = document.getElementById("result-popup");

    popup.innerHTML = ` <button type="button" id="goBack" class="choose">Voltar ao lobby</button>
    <button type="button" id="resetGame" class="choose">Jogar novamente</button>`;
    popup.className = "center";

    const goBack = document.getElementById("goBack");
    const resetGame = document.getElementById("resetGame");

    goBack.addEventListener("click", (event) => {
        popup.className = `${popup.className} hidden`;

        document.getElementById("lobby-screen").classList.remove("hidden");

        const board = document.getElementById(`${boardId}`);
        board.className = `${board.className} hidden`;
        console.log("oi");
    });
    resetGame.addEventListener("click", (event) => {
        if (isPlayer1) {
            challenge(player2Id);
        } else {
            challenge(player1Id);
        }
        popup.className = `${popup.className} hidden`;
    });
    board.parentNode.removeChild(board);
};

const updateUsers = (data) => {
    const list = document.getElementById("players-online");
    list.innerHTML = "";
    data.available.forEach((element) => {
        list.insertAdjacentHTML(
            "beforeend",
            `<li> <button type="button" id="${element.id}"  onclick="challenge(this.id)" class="list-group-item player status-${element.status} minWidth">${element.name}</button> </li>`
        );
    });
};
const informWinner = (player1Id, player2Id, isPlayer1, boardId, playerName) => {
    disableCells();
    alert(`O jogador ${playerName} venceu a partida`);
    const popup = document.getElementById("result-popup");

    popup.innerHTML = ` <button type="button" id="goBack" class="choose">Voltar ao lobby</button>
    <button type="button" id="resetGame" class="choose">Jogar novamente</button>`;
    popup.className = "center";

    const goBack = document.getElementById("goBack");
    const resetGame = document.getElementById("resetGame");

    const board = document.getElementById(`${boardId}`);
    goBack.addEventListener("click", (event) => {
        popup.className = `${popup.className} hidden`;

        document.getElementById("lobby-screen").classList.remove("hidden");
        console.log("oi");
    });
    resetGame.addEventListener("click", (event) => {
        if (isPlayer1) {
            challenge(player2Id);
        } else {
            challenge(player1Id);
        }
        popup.className = `${popup.className} hidden`;
    });
    const startMessage = document.getElementById("playerTurn");
    startMessage.innerHTML = "";

    board.parentNode.removeChild(board);
};

const challenge = (id) => {
    const data = {
        action: "challengePlayer",
        challengedPlayerId: id,
    };
    socket.send(JSON.stringify(data));
};

const updateCell = (cellId, boardId) => {
    const data = {
        action: "updateCell",
        cellId,
        boardId,
    };

    socket.send(JSON.stringify(data));
};

const updateGame = (cellId, player1Turn, isYourTurn) => {
    const cells = document.getElementsByClassName("cell");
    const cell = Array.prototype.filter.call(
        cells,
        (cell) => cell.id === cellId
    )[0];

    const startMessage = document.getElementById("playerTurn");
    if (isYourTurn) {
        startMessage.innerHTML = "É a sua vez";
        enableCells();
    } else {
        startMessage.innerHTML = "Aguardando o outro jogador ✋🏻✋🏻✋🏻";
        disableCells();
    }

    if (!player1Turn) {
        cell.innerHTML = "X";
    } else {
        cell.innerHTML = "O";
    }

    Array.prototype.filter.call(cells, (cell) => {
        if (cell.innerHTML !== "") {
            cell.disabled = true;
        }
    })[0];
};

const handleChallenge = (player1, player2) => {
    const buttons = document.getElementById("challenge-popup");

    buttons.className = "center";
    const acceptButton = document.getElementById("acceptButton");
    const refuseButton = document.getElementById("refuseButton");

    if (counter === 0) {
        acceptButton.addEventListener("click", (event) => {
            const data = {
                action: "createGame",
                player1: `${player1.id}`,
                player2: `${player2.id}`,
            };
            buttons.className = "center hidden";
            document.getElementById("challenge-popup").classList.add("hidden");
            socket.send(JSON.stringify(data));
        });

        refuseButton.addEventListener("click", (event) => {
            const data = {
                action: "refuseChallenge",
                player: player1.id,
            };
            buttons.className = "center hidden";
            socket.send(JSON.stringify(data));
            refuseButton.removeEventListener("click", () => {});
        });
    }
    counter++;
};

const disableCells = () => {
    const cells = document.getElementsByClassName("cell");
    Array.prototype.forEach.call(cells, (element) => {
        element.disabled = true;
    });
};

const enableCells = () => {
    const cells = document.getElementsByClassName("cell");
    Array.prototype.forEach.call(cells, (element) => {
        element.disabled = false;
    });
};

const enterGame = (id, disable) => {
    const board = `<table id="${id}" class="center">
        <tr>
            <td>
                <button type="button" class="cell" id="cell00"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell01"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell02"></button>
            </td>
        </tr>
        <tr>
            <td>
                <button type="button" class="cell" id="cell10"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell11"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell12"></button>
            </td>
        </tr>
        <tr>
            <td>
                <button type="button" class="cell" id="cell20"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell21"></button>
            </td>
            <td>
                <button type="button" class="cell" id="cell22"></button>
            </td>
        </tr>
    </table>`;

    const boardContainer = document.getElementById("game-screen");

    const lobby = document.getElementById("lobby-screen");

    lobby.className = "center hidden";

    boardContainer.className = "center";

    boardContainer.innerHTML = boardContainer.innerHTML + board;

    const startMessage = document.getElementById("playerTurn");

    if (disable) {
        disableCells();
        startMessage.innerHTML = "Aguardando o outro jogador ✋🏻✋🏻✋🏻";
    } else {
        startMessage.innerHTML = "É a sua vez";
    }

    const cells = document.getElementsByClassName("cell");

    Array.prototype.forEach.call(cells, (element) => {
        element.addEventListener("click", (event) => {
            updateCell(element.id, id);
        });
    });
};

document.addEventListener("DOMContentLoaded", (event) => {
    connectToServer("ws://localhost:8080");
});
