import { FlightFormData } from "api/flight-service";
import ServiceLocator from "api/service.locator";
import CreateFlight from "components/CreateFlight";
import { FunctionComponent } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface FlightProps {}

const Flight: FunctionComponent<FlightProps> = () => {
  const navigate = useNavigate();
  return (
    <CreateFlight
      onCreate={async (formData: FlightFormData) => {
        const flight = await ServiceLocator.flightService.createFlight(
          formData
        );
        if (flight != null) {
          console.log("flight created successfuly");
          console.log(JSON.stringify(flight));
          await Swal.fire("", "Flight created successfuly.", "success");
          navigate(0);
        }
      }}
    />
  );
};
export default Flight;
