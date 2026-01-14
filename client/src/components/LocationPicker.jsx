import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: 23.7508, lng: 90.3911 };
const DEFAULT_ZOOM = 14;

let mapsLoaderPromise;

const loadGoogleMaps = (apiKey) => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
        return Promise.resolve(window.google.maps);
    }
    if (mapsLoaderPromise) {
        return mapsLoaderPromise;
    }
    mapsLoaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps failed to load'));
        document.head.appendChild(script);
    });
    return mapsLoaderPromise;
};

const LocationPicker = ({ value, onLocationSelect }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const clickListenerRef = useRef(null);
    const [status, setStatus] = useState('loading');
    const onSelectRef = useRef(onLocationSelect);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        onSelectRef.current = onLocationSelect;
    }, [onLocationSelect]);

    useEffect(() => {
        let isActive = true;

        if (!apiKey) {
            setStatus('missing-key');
            return () => {};
        }

        loadGoogleMaps(apiKey)
            .then(() => {
                if (!isActive || !containerRef.current) {
                    return;
                }
                if (!mapRef.current) {
                    const center = value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;
                    mapRef.current = new window.google.maps.Map(containerRef.current, {
                        center,
                        zoom: DEFAULT_ZOOM,
                        clickableIcons: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        streetViewControl: false
                    });

                    clickListenerRef.current = mapRef.current.addListener('click', (event) => {
                        if (!event.latLng) {
                            return;
                        }
                        const coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
                        if (markerRef.current) {
                            markerRef.current.setPosition(coords);
                        } else {
                            markerRef.current = new window.google.maps.Marker({
                                position: coords,
                                map: mapRef.current
                            });
                        }
                        if (onSelectRef.current) {
                            onSelectRef.current(coords);
                        }
                    });

                    if (value) {
                        markerRef.current = new window.google.maps.Marker({
                            position: { lat: value.lat, lng: value.lng },
                            map: mapRef.current
                        });
                    }
                }
                setStatus('ready');
            })
            .catch(() => {
                if (isActive) {
                    setStatus('error');
                }
            });

        return () => {
            isActive = false;
            if (clickListenerRef.current) {
                clickListenerRef.current.remove();
                clickListenerRef.current = null;
            }
        };
    }, [apiKey]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        if (!value) {
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
            return;
        }

        const coords = { lat: value.lat, lng: value.lng };
        if (markerRef.current) {
            markerRef.current.setPosition(coords);
        } else {
            markerRef.current = new window.google.maps.Marker({
                position: coords,
                map: mapRef.current
            });
        }
        mapRef.current.panTo(coords);
    }, [value]);

    return (
        <div className="h-full w-full relative">
            <div ref={containerRef} className="h-full w-full" />
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300 bg-black/40">
                    Loading map...
                </div>
            )}
            {status === 'missing-key' && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300 bg-black/40">
                    Missing Google Maps API key.
                </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300 bg-black/40">
                    Map failed to load.
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
