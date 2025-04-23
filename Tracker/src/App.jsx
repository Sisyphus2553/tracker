import { useEffect, useState } from "react";
import socket from "./socket"; // 👈 import shared socket

function App() {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("send-Location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
      }
    };

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

    return () => {
      clearInterval(interval);
      // ❌ don't disconnect socket here
    };
  }, []);

  return (
    <div>
      <h1>Live Tracker</h1>
      <ul>
        {Object.entries(locations).map(([id, loc]) => (
          <li key={id}>
            ID: {id}, Lat: {loc.lat}, Lng: {loc.lng}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
