const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach"
const axios = require("axios");

const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();

app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
let interval;

io.on("connection", socket => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  console.log('New connection ' + socketId + ' from ' + clientIp);
  socket.emit('initialData', data);
  socket.on("updateStation", (val) => {
    data = data.filter(x => x.id !== val.id).concat(val);
    io.sockets.emit('updateData', data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use("/stats", (request, val) => {
  axios.get(citybikeurl).then(result => {
    const usageBike = [];
    result.data.network.stations.map(place => {
      const allBikes = place.free_bikes + place.empty_slots;
      const freeBikes = place.free_bikes / allBikes;
      const emptySlots = place.empty_slots / allBikes;
      usageBike.push({...place, freeBikes: freeBikes, emptySlots: emptySlots});
    });
    const emptyStations = usageBike.sort((a,b) => b.emptySlots - a.emptySlots).slice(0,4);
    const usedStations = usageBike.sort((a,b) => a.freeBikes - b.freeBikes).slice(0,4);
    val.setHeader('Content-Type', 'application/json');
    val.send({usedStations: usedStations, emptyStations: emptyStations}).status(200);
  }).catch(error => {
    console.log(error);
  });
});

const init = () => {
  console.log(`Listening on port ${port}`)
  axios.get(citybikeurl).then(result => {
    data = result.data.network.stations.map(x => ({lat: x.latitude, long: x.longitude, name: x.name, id: x.id, free_bikes: x.free_bikes, empty_slots: x.empty_slots, is_damaged: false}));
  }).catch(error => {
    console.log(error);
  })
}

server.listen(port, init );



