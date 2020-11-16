let socket;

const connectToServer = (url) => {
    socket = new WebSocket(url);

    socket.onopen = () => {
        const data = {
            action: "getPlayers",
        };
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = (event) => {
        const dataRecived = JSON.parse(event.data);
        switch (dataRecived.action) {
            case "updateUsersStatus":
                updateUsers(dataRecived.users);
                break;

            case "selfChallenge":
                alert("Você não pode se desafiar");
                break;

            case "playerNotAvailable":
                alert("Esse player não está disponível");
                break;

            case "acceptChallenge":
                handleChallenge(dataRecived.player1, dataRecived.player2);
                break;

            case "enterGame":
                enterGame(dataRecived.game.id);
                break;

            case "challengeRefused":
                alert("Seu desafio foi recusado");
                break;
            case "updateGame":
                updateGame(dataRecived.cellId);
                break;
            default:
                break;
        }
    };
};

const updateUsers = (data) => {
    const list = document.getElementById("players-online");
    list.innerHTML = "";
    data.available.forEach((element) => {
        list.insertAdjacentHTML(
            "beforeend",
            `<li> <button type="button" id="${element.id}"  onclick="challenge(this.id)" class="player status-${element.status}">${element.name}</button> </li>`
        );
    });
};

const challenge = (id) => {
    const data = {
        action: "challengePlayer",
        challengedPlayerId: id,
    };
    socket.send(JSON.stringify(data));
};

const updateCell = (cellId, boardId) => {
    // const cell = document.getElementById(id);

    const data = {
        symbol: "x",
        action: "updateCell",
        cellId,
        boardId,
    };

    socket.send(JSON.stringify(data));
};

const updateGame = (cellId) => {
    const cells = document.getElementsByClassName("cell");
    const cell = Array.prototype.filter.call(
        cells,
        (cell) => cell.id === cellId
    )[0];

    cell.innerHTML = "X";
};

const handleChallenge = (player1, player2) => {
    const buttons = document.getElementById("challenge-popup");

    buttons.className = "center";
    const acceptButton = document.getElementById("acceptButton");
    const refuseButton = document.getElementById("refuseButton");

    acceptButton.addEventListener("click", (event) => {
        const data = {
            action: "createGame",
            player1: `${player1.id}`,
            player2: `${player2.id}`,
        };

        socket.send(JSON.stringify(data));
    });

    refuseButton.addEventListener("click", (event) => {
        const data = {
            action: "refuseChallenge",
            player: player1.id,
        };
        socket.send(JSON.stringify(data));
    });
    buttons.className = "center hidden";
};

const enterGame = (id) => {
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

    boardContainer.innerHTML = board;

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
