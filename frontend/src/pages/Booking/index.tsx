import SeatBooking from "components/SeatBooking";
import { FunctionComponent } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface FlightBookingProps {}

const FlightBooking: FunctionComponent<FlightBookingProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, to } = location.state;
  if (from === undefined || to === undefined) {
    return <></>;
  }
  return (
    <>
      <SeatBooking fromFlightData={from} toFlightData={to}/>
    </>
  );
};

export default FlightBooking;
