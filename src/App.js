import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import "./index.css";
import { FaSun, FaMoon } from "react-icons/fa";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

  useEffect(() => {
    if (coordinates && mapRef.current) {
      if (!mapInstance.current) {
        mapInstance.current = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          view: new View({
            center: fromLonLat([coordinates.lon, coordinates.lat]),
            zoom: 10,
          }),
        });

        vectorLayerRef.current = new VectorLayer({
          source: new VectorSource(),
        });

        mapInstance.current.addLayer(vectorLayerRef.current);
      }

      vectorLayerRef.current.getSource().clear();

      const marker = new Feature({
        geometry: new Point(fromLonLat([coordinates.lon, coordinates.lat])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
            scale: 0.5,
          }),
        })
      );

      vectorLayerRef.current.getSource().addFeature(marker);
      mapInstance.current.getView().setCenter(fromLonLat([coordinates.lon, coordinates.lat]));
    }
  }, [coordinates]);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setCoordinates({
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
      });
    } catch (error) {
      alert("City not found! Please try again.");
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
      </div>
      <div className="weather-box">
        <h1 className="title">Weather App</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
          />
          <button onClick={fetchWeather} className="search-button">
            Get Weather
          </button>
        </div>

        {weather && (
          <div className="weather-info">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <p>Temperature: {weather.main.temp}°C</p>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} m/s</p>
          </div>
        )}
      </div>

      {coordinates && (
        <div className="map-container">
          <div ref={mapRef} className="map-box"></div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
