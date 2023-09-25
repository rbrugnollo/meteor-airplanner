import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Box, Dialog, DialogActions, DialogContent } from '@mui/material';
import { Close } from '@mui/icons-material';
import DeckGL from '@deck.gl/react/typed';
import { ArcLayer } from '@deck.gl/layers/typed';
import ReactMapGL from 'react-map-gl';
import { FlightsCollection } from '/imports/api/flights/collection';
import { getMany } from '/imports/api/airports/methods/getMany';
import { sum } from 'lodash';
import { Meteor } from 'meteor/meteor';

interface FlightRouteModalProps {
  readonly open: boolean;
  readonly flightGroupId?: string;
  readonly onClose: () => void;
}

interface FlightArcValues {
  readonly flyFrom: string;
  readonly flyTo: string;
  readonly source: [number, number];
  readonly target: [number, number];
}

const FlightRouteModal = ({ open, flightGroupId, onClose }: FlightRouteModalProps) => {
  const [flightArcValues, setFlightArcValues] = useState<FlightArcValues[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open]);

  const fetchData = async () => {
    setFlightArcValues([]);
    setIsLoading(true);
    const flights = await FlightsCollection.find({ groupId: flightGroupId }).fetchAsync();

    if (flights.length) {
      const airports = await getMany({
        airportIds: flights.flatMap((m) => [m.origin.value, m.destination.value]),
      });

      const values: FlightArcValues[] = flights.map((flight) => ({
        flyFrom: flight.origin.label,
        flyTo: flight.destination.label,
        source: [
          parseFloat(airports.find((f) => f._id === flight.origin.value)!.lon),
          parseFloat(airports.find((f) => f._id === flight.origin.value)!.lat),
        ],
        target: [
          parseFloat(airports.find((f) => f._id === flight.destination.value)!.lon),
          parseFloat(airports.find((f) => f._id === flight.destination.value)!.lat),
        ],
      }));

      setFlightArcValues(values);
    }
    setIsLoading(false);
  };

  const arcLayer = new ArcLayer<FlightArcValues>({
    id: 'arc-layer',
    data: flightArcValues,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: [0, 102, 204],
    getTargetColor: [0, 255, 0],
    getWidth: 3,
    greatCircle: true,
    getHeight: 1,
    wrapLongitude: true,
  });

  const getInitialViewState = (values: FlightArcValues[]) => {
    if (!values.length)
      return {
        longitude: 0,
        latitude: 0,
        zoom: 3,
        pitch: 0,
        bearing: 0,
      };

    const lats = values.flatMap((m) => (m.source[1], m.target[1]));
    const lons = values.flatMap((m) => (m.source[0], m.target[0]));
    const midLat = sum(lats) / lats.length;
    const midLon = sum(lons) / lons.length;

    return {
      longitude: midLon,
      latitude: midLat,
      zoom: 3,
      pitch: 0,
      bearing: 0,
    };
  };

  const initialViewState = getInitialViewState(flightArcValues);

  return (
    <Dialog maxWidth="xl" open={open} onClose={onClose}>
      <DialogContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ width: 500, height: 500 }}>
            <DeckGL layers={[arcLayer]} initialViewState={initialViewState} controller={true}>
              <ReactMapGL
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxAccessToken={Meteor.settings.public.mapBox.apiKey}
                doubleClickZoom
                {...initialViewState}
              />
            </DeckGL>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary" startIcon={<Close />}>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightRouteModal;
