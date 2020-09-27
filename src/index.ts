// Handle the application imports
import ws from 'ws';

/*****************************************************
 * 
 * Manage some housekeeping and configuration details.
 * 
 *****************************************************/

// Retrieve the values from the command line (prepopulated with the defaults).
const options = require('minimist')(process.argv.slice(2));

// Set some constants for ease of use and understanding.
/** The port provided by the CLI args (default: 8443) */
const PORT = options.port ?? options.p ?? 8443;

/** Whether we should broadcast to ourselves when a message is sent (echo to self) */
const ShouldBroadcastToSelf = options.loopback ?? options.l ?? false;

/** The size of the history stack to send to newly connecting users. */
const HistoryStackSize = options.history ?? options.h ?? 20;

/*************************************
 * 
 * Start the socket server management.
 * 
 *************************************/

// Star the websocket server.
const wsServer = new ws.Server({ port: PORT });

// Maintain a history stack.
const history: any[] = [];

/** Event handler for new WebSocket messages */
const OnSocketMessage = (socket: ws, msg: ws.Data) => {
  // Keep our history stack. This will be pushed to newly connecting clients.
  history.push(msg);

  wsServer.clients.forEach(client => {
    // Make sure that the websocket is open, and if not ShouldBroadcastToSelf, that the client isn't the sender.
    if (client.readyState === socket.OPEN && (ShouldBroadcastToSelf || client !== socket)) {
      client.send(msg);
    }
  })
}

// When the websocket server receives a connection...
wsServer.on('connection', socket => {
  // When a new socket connects, we want it to receive the history stack (limited to the last N results);
  socket.send(JSON.stringify(history.slice(HistoryStackSize * -1)));

  // Add listener, so as to broadcast messages to all clients
  socket.on('message', data => OnSocketMessage(socket, data));
});

// Event fired when the socket server is listening.
wsServer.on('listening', () => {
  // Report back the port that it's running on.
  console.log(`Socketserver listening on port ${(wsServer.address() as ws.AddressInfo).port}`);
  // Inform the user if the server is configured to broadcast a loopback message.
  console.log(`This server ${ShouldBroadcastToSelf ? 'will' : 'will not'} send received commands back to the immediate sender.`);
  // Report on what size history stack newly connecting clients may receive.
  console.log(`New connections will receive up to ${HistoryStackSize} history items.`);
});