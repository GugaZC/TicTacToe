var socket;

function connectToServer(url) {
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("oi eu conectei");
    }

    socket.onmessage = function (event) {
        const json = JSON.parse(event.data)
        const message = json.data

        const cell = document.getElementById(message.id);

        cell.innerHTML = `<p>${message.symbol}</p>`
    }
}

function updateCell(id) {
    const cell = document.getElementById(id);

    const data = {
        symbol: "x",
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