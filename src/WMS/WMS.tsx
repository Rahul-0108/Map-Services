import { Button, Input } from "@itwin/itwinui-react";
import { LatLngExpression } from "leaflet";
import React, { useState } from "react";
import { MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

export const WMS = () => {
  const [wmsurl, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, Setpassword] = useState("");
  const defaultPosition: LatLngExpression = [48.864716, 2.349]; // Paris position
  const [wmsconnect, setWmsconnect] = useState(false);
  const [layerNames, setlayerNames] = useState<string[]>([])
  const [message, setMessage] = useState("");
  return (
    <div style={{ margin: "10px" }}>
      <div className="upperdev">
        <p>{"URL"}</p>
        <Input type="text" value={wmsurl} onChange={(event: any) => setUrl(event.target.value)}></Input>
        <p>{"Username"}</p>
        <Input type="text" value={username} onChange={(event: any) => setUsername(event.target.value)}></Input>
        <p>{"Password"}</p>
        <Input type="text" value={password} onChange={(event: any) => Setpassword(event.target.value)}></Input>
        {message}
        <div style={{ height: "500px" }}>
          <MapContainer
            center={defaultPosition}
            zoom={13}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {wmsconnect && <WMSTileLayer
              layers={layerNames.join(",")}
              url={wmsurl}
            />}
          </MapContainer>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "10px", display: "flex", flexDirection: "column", left: "10px", gap: "10px", right: "15px" }}>
        <>
          <Button style={{
            backgroundColor: "rgba(162, 162, 162, 0.4)"
          }} onClick={() => {
            setlayerNames([]);
            setWmsconnect(false);
            setMessage("");
            // Send a Fetch request to fetch the GetCapabilities XML
            fetch(`${wmsurl}?service=WMS&version=1.3.0&request=GetCapabilities`)
              .then(function (response) {
                if (response.ok) {
                  return response.text();
                } else {
                  setMessage("Could not connect");
                  throw new Error("Error fetching GetCapabilities XML: " + response.status);
                }
              })
              .then(function (xmlText) {
                var parser = new DOMParser();
                var capabilitiesXml = parser.parseFromString(xmlText, "text/xml");

                // Parse the XML and retrieve layer names
                var layerElements = capabilitiesXml.getElementsByTagName("Layer");
                var layerNames: any = [];

                // Recursive function to extract layer names
                function getLayerNames(layers: any) {
                  for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];

                    // Get the name of the current layer
                    var layerNameElement = layer.getElementsByTagName("Name")[0];
                    var layerName = layerNameElement.firstChild.nodeValue;

                    // Add the layer name to the array
                    layerNames.push(layerName);

                    // Check if the layer has sub-layers
                    var subLayers = layer.getElementsByTagName("Layer");
                    if (subLayers.length > 0) {
                      getLayerNames(subLayers);
                    }
                  }
                }

                // Call the recursive function with the top-level layer elements
                getLayerNames(layerElements);

                // Output the layer names
                console.log(layerNames);
                if (layerNames.length > 0) {
                  setlayerNames(layerNames);
                  setWmsconnect(true);
                  setMessage("Connected Succesfully");
                }
                else {
                  setMessage("could not connect");
                }
              })
              .catch(function (error) {
                console.error(error);
                if (!error.message.includes("GetCapabilities")) {
                  setMessage("connected but failed in parsing the data");
                }
              });
          }}>{"Connect"}</Button>
          <Button>{"Cancel"}</Button>
        </>
      </div>
    </div >


  );
}