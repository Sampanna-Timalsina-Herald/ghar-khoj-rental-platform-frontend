import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const initializedRef = useRef(false);

  // Default center (Kathmandu, Nepal)
  const defaultCenter = { lat: 27.7172, lng: 85.3240 };

  const addMarker = useCallback((lat, lng) => {
    if (!mapInstanceRef.current || !window.L) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    const newMarker = window.L.marker([lat, lng], {
      icon: window.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);

    markerRef.current = newMarker;
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      setSearching(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const location = {
          lat,
          lng,
          address: data.display_name || '',
          city: data.address.city || data.address.town || data.address.village || data.address.state || '',
          country: data.address.country || 'Nepal',
          postcode: data.address.postcode || '',
          formatted: data.display_name || ''
        };

        setSelectedLocation(location);
        onLocationSelect?.(location);
      } else {
        const location = {
          lat,
          lng,
          address: '',
          city: '',
          country: 'Nepal',
          postcode: '',
          formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        setSelectedLocation(location);
        onLocationSelect?.(location);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      const location = {
        lat,
        lng,
        address: '',
        city: '',
        country: 'Nepal',
        postcode: '',
        formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      setSelectedLocation(location);
      onLocationSelect?.(location);
    } finally {
      setSearching(false);
    }
  }, [onLocationSelect]);

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=np`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        addMarker(lat, lng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        await reverseGeocode(lat, lng);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, addMarker, reverseGeocode]);

  useEffect(() => {
    if (initializedRef.current) return;

    const initializeMap = () => {
      if (!window.L || mapInstanceRef.current || !mapContainerRef.current) return;

      const center = initialLocation && initialLocation.lat && initialLocation.lng
        ? [initialLocation.lat, initialLocation.lng]
        : [defaultCenter.lat, defaultCenter.lng];

      const mapInstance = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
      }).setView(center, 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      initializedRef.current = true;

      // Add click event to map
      mapInstance.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          mapInstance.removeLayer(markerRef.current);
        }

        // Add new marker
        const newMarker = window.L.marker([lat, lng], {
          icon: window.L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
          })
        }).addTo(mapInstance);

        markerRef.current = newMarker;

        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          
          const data = await response.json();
          
          if (data && data.address) {
            const location = {
              lat,
              lng,
              address: data.display_name || '',
              city: data.address.city || data.address.town || data.address.village || data.address.state || '',
              country: data.address.country || 'Nepal',
              postcode: data.address.postcode || '',
              formatted: data.display_name || ''
            };

            setSelectedLocation(location);
            onLocationSelect?.(location);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
      });

      // Add initial marker if location exists
      if (initialLocation && initialLocation.lat && initialLocation.lng) {
        const newMarker = window.L.marker([initialLocation.lat, initialLocation.lng], {
          icon: window.L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
          })
        }).addTo(mapInstance);
        markerRef.current = newMarker;
      }
    };

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
      return;
    }

    // Load Leaflet CSS
    const existingLink = document.querySelector('link[href*="leaflet"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const existingScript = document.querySelector('script[src*="leaflet"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else if (window.L) {
      initializeMap();
    } else {
      existingScript.addEventListener('load', initializeMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Search location (e.g., Thamel, Kathmandu)"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {searching ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={20} />
              Search
            </>
          )}
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How to select location:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Search for a location using the search bar above</li>
            <li>Or click anywhere on the map to place a marker</li>
            <li>The address will be automatically filled</li>
          </ul>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-96 rounded-lg border-2 border-gray-300 overflow-hidden"
          style={{ zIndex: 0 }}
        />
        
        {searching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <Loader2 size={40} className="animate-spin text-primary-600" />
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Selected Location</h4>
              <div className="space-y-1 text-sm text-green-800">
                {selectedLocation.formatted && (
                  <p><strong>Address:</strong> {selectedLocation.formatted}</p>
                )}
                {selectedLocation.city && (
                  <p><strong>City:</strong> {selectedLocation.city}</p>
                )}
                <p><strong>Coordinates:</strong> {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationPicker;
