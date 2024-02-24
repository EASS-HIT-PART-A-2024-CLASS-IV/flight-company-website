import { Button } from "@mui/material";
import {
  FlightFromService,
  FlightSearchFormData,
  Flight,
} from "api/flight-service";
import ServiceLocator from "api/service.locator";
import FlightsTable from "components/FlightsTable";
import SeachFlight from "components/SearchFlight";
import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  const [flights, setFlights] = useState<FlightFromService[][]>([]);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [from, setFrom] = useState<FlightFromService>();
  const [to, setTo] = useState<FlightFromService>();
  const navigate = useNavigate();
  const handleBuyClick = () => {
    navigate("/buy", { state: { from, to } });
  };
  return (
    <>
      <SeachFlight
        onSearch={async (formData: FlightSearchFormData) => {
          const response: FlightFromService[][] | void =
            await ServiceLocator.flightService.searchFlight(formData);
          if (response == null) return;
          setCheckInDate(formData.checkIn);
          setCheckOutDate(formData.checkOut);
          setSource(formData.source);
          setDestination(formData.destination);
          setFlights(response);
        }}
      />
      {flights.length === 2 && (
        <>
          <FlightsTable
            flightFormData={flights[0]}
            onClick={(flight) => setFrom(flight)}
            date={checkInDate}
            source={source}
            destination={destination}
          />
          <FlightsTable
            flightFormData={flights[1]}
            onClick={(flight) => setTo(flight)}
            date={checkOutDate}
            source={destination}
            destination={source}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <Button
              variant="contained"
              onClick={handleBuyClick}
              disabled={from == null || to == null}
            >
              Buy plane tickets
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
