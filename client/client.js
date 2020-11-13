let socket;

function connectToServer(url) {
    socket = new WebSocket(url);

    socket.onopen = () => {
        const data = {
            action: "getPlayers"
        }
        socket.send(JSON.stringify(data));
    }

    socket.onmessage =  event => {
        const dataRecived = JSON.parse(event.data)
        switch (dataRecived.action) {
            case "updateUsersStatus":
                updateUsers(dataRecived.users)
                break;
            
            case "selfChallenge":
                alert("Você não pode se desafiar")
                break;

            case "playerNotAvailable":
                alert("Esse player não está disponível")
                break;

            case "acceptChallenge":
                alert(`Você foi desafiado pelo ${dataRecived.player}`)
                break;

            default:
                break;
        }
        // const message = json.data

        // const cell = document.getElementById(message.id);

        // cell.innerHTML = `${message.symbol}`
    }
}

const updateUsers = (data) => {
    const list = document.getElementById("players-online")
    list.innerHTML = ''
    data.available.forEach( element => {
        list.insertAdjacentHTML("beforeend",`<li> <button type="button" id="${element.id}"  onclick="challenge(this.id)" class="player status-${element.status}">${element.name}</button> </li>`)
    })
}

const challenge = (id) => {
    const data = {
        action: "challengePlayer",
        challengedPlayerId:id, 
    }
    socket.send(JSON.stringify(data))
}

const updateCell = id => {
    const cell = document.getElementById(id);

    const data = {
        symbol: "x",
        action: "updateCell",
        id
    }

    socket.send(JSON.stringify(data))
}

document.addEventListener("DOMContentLoaded", event => {

    connectToServer('ws://localhost:8080');

    const cells = document.getElementsByClassName("cell");

    Array.prototype.forEach.call(cells, element => {
        element.addEventListener('click', event => {
            updateCell(element.id)
        })
    });

});