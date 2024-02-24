import CountriesService from "./contries-service"
import AuthService from './auth-service/index';
import FlightService from './flight-service/index';
import PaymentService from "./payment-service";

class ServiceLocator {
    public static countriesService: CountriesService
    public static authService: AuthService;
    public static flightService: FlightService;
    public static paymentService: PaymentService;
    public static initializeServices() {
        ServiceLocator.countriesService = new CountriesService();
        ServiceLocator.authService = new AuthService();
        ServiceLocator.flightService = new FlightService();
        ServiceLocator.paymentService = new PaymentService();
    }
}
export default ServiceLocator