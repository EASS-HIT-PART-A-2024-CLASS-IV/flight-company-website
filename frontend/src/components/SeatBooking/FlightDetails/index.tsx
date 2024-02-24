import React from "react";
import { Typography } from "@mui/material";
import { FlightFromService } from "api/flight-service";

interface FlightDetailsProps {
  flightData: FlightFromService;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flightData }) => {
  return (
    <>
      <Typography variant="h5">Flight Details</Typography>
      <Typography variant="body1">
        Flight Number: {flightData.number}
      </Typography>
      <Typography variant="body1">Source: {flightData.source}</Typography>
      <Typography variant="body1">
        Destination: {flightData.destination}
      </Typography>
      <Typography variant="body1">Date: {flightData.date}</Typography>
      <Typography variant="body1">Time: {flightData.time}</Typography>
      <Typography variant="body1">Cost: ${flightData.cost}</Typography>
    </>
  );
};

export default FlightDetails;
