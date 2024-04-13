const net = require("net");
const Parser = require("redis-parser");


const store = {};
const server = net.createServer((connection) => {
  console.log("Client connected...");

  //Accepting Commands
  connection.on("data", (data) => {
    const parser = new Parser({
      returnReply: function (reply) {
        //  console.log("Reply received: ", reply);
        //Handling Commands
        const command = reply[0].toUpperCase();
        switch (command) {
          case "PING":
            connection.write("+PONG\r\n");
            break;
          case "SET":
            const key = reply[1];
            const value = reply[2];
            store[key] = value;
            connection.write("+OK\r\n");
            break;
          case "GET":
            const keyToGet = reply[1];
            const valueToGet = store[keyToGet];
            if (valueToGet) {
              connection.write(`$${valueToGet.length}\r\n${valueToGet}\r\n`);
            } else {
              connection.write("$-1\r\n");
            }
            break;
          default:
            connection.write("-ERR unknown command\r\n");
        }
      },

      returnError: function (err) {
        console.error("Error received: ", err);
      },
    });
    parser.execute(data);
    // const command = data.toString().trim();
    // console.log("Command received: ", command);
  });
});

server.listen(8000, () => {
  console.log("Custom Redis is listening at port 8000");
});
