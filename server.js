const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 }, function () {
    console.log('server on');
});

let socketsConnected = [];

wss.on('connection', ws => {
    socketsConnected.push(ws)

    ws.on('message', data => {
        const content = {
            data: JSON.parse(data),
        }
        const senderId = socketsConnected.indexOf(ws)

        socketsConnected.forEach((socket, index) => {
            if (index == senderId) {
                socket.send(JSON.stringify({
                    data: JSON.parse(data),
                    isSender: true
                }))
            } else {
                socket.send(JSON.stringify(content))
            }
        })

    });

    ws.on('close', function connectionLost(element) {

        const index = socketsConnected.indexOf(ws)
        socketsConnected.splice(index, 1)
    })
});

