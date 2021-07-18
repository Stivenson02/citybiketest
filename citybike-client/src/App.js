import React, { Component,useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";

class App extends Component {

  constructor() {
    super();

    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001/",
      lat: 25.80,
      lng: -80.20,
      zoom: 12,
      stations :[]
    };


  }

  componentDidMount() {
    const self= this
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("citybike", function(data){
      const result = JSON.parse(data)
      self.setState({stations: result.network.stations})
    })
  }


  render() {
    const { response } = this.state;
    const position = [this.state.lat, this.state.lng]


    return (

        <div className="map">
          <h1> City Bikes in Miami </h1>
          <Map center={position} zoom={this.state.zoom}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
              response.length > 0 && response.map((station)=>(
                  <Marker key={station.id} position={[station.latitude, station.longitude]} title={station.name}>
                    <Popup>
                        <div>
                          <div>
                            {station.name}
                          </div>
                          <div>
                            {station.id}
                          </div>
                          <div>
                            {station.free_bikes}
                          </div>
                          <div>
                            {station.empty_slots}
                          </div>
                        </div>
                    </Popup>
                  </Marker>
              ))
            }
          </Map>
        </div>
    );
  }
}
export default App;
