// src/components/MapComponent.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = () => {
  const position = [41.7015725, 2.7196943]; // Coordenadas exactas según la captura
  const googleMapsLink = "https://www.google.com/maps/place/Carrer+Sant+Antoni,+11,+08490+Tordera,+Barcelona/@41.7015725,2.7196943,20.5z/";

  return (
    <MapContainer center={position} zoom={17} style={{ height: "200px", width: "100%", borderRadius: "10px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          <strong>Comunidad Islámica de Tordera 📍</strong>
          <br />
          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", fontWeight: "bold" }}>
            Abrir en Google Maps
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;




