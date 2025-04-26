import { useEffect, useState } from "react";
import socket from "./socket";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [locations, setLocations] = useState({});
  const [userLocation, setUserLocation] = useState(null); // 👈 start as null

  useEffect(() => {
    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation([lat, lng]); // 👈 update map center + marker
            socket.emit("send-Location", { lat, lng });
          },
          (err) => console.error("Location error:", err)
        );
      } else {
        console.error("Geolocation not supported.");
      }
    };

    sendLocation(); // 👈 get location on mount
    const interval = setInterval(sendLocation, 5000);

    socket.on("receive-Location", (data) => {
      setLocations((prev) => ({ ...prev, [data.id]: data }));
    });

    socket.on("user-disconnected", (id) => {
      setLocations((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1>Live Tracker</h1>
      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: "90%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />
          {Object.entries(locations).map(([id, loc]) => (
            <Marker key={id} position={[loc.lat, loc.lng]}>
              <Popup>
                ID: {id}<br />Lat: {loc.lat}<br />Lng: {loc.lng}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

export default App;
