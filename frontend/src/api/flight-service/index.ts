import BaseService from "api/baseService";
import ServiceLocator from "api/service.locator";
import axios from "axios";
import config from "config";
import Swal from "sweetalert2";

export interface FlightFormData {
    number: string;
    source: string;
    destination: string;
    cost_per_seat: number;
    date: string;
    time: string;
}
export interface FlightFromService {
    number: string;
    source: string;
    destination: string;
    seats: Seats[],
    cost: number;
    date: string;
    time: string;
}
export interface FlightSearchFormData {
    source: string,
    destination: string,
    checkIn: string,
    checkOut: string,
}

export class Flight {
    number: string = "0";
    source: string = "0";
    destination: string = "";
    seats: Seats[] = [];
}

export interface Seats {
    number: string;
    isLocked: boolean
}

export default class FlightService extends BaseService {

    constructor() {
        super("FlightService", config.FLIGHT_HTTP)
    }
    public async createFlight(flight: FlightFormData): Promise<Flight | void> {
        try {
            flight.date = this.formatDate(flight.date)
            const createdFlight: Flight = await axios.post<Flight>('/flights', flight, this.getAuthHeader()).then(response => response.data)
            return createdFlight;
        } catch (err: any) {
            // unauth err
            if (err?.response?.status === 401 || err?.response?.status === 404) {
                return await ServiceLocator.authService.handleUnAuthError<Flight>(err).then(response => response?.data)
            } else {
                this.handleHttpError(err);
            }
        }
    }
    public async searchFlight(formData: FlightSearchFormData): Promise<FlightFromService[][] | void> {
        try {
            formData.checkIn = this.formatDate(formData.checkIn);
            formData.checkOut = this.formatDate(formData.checkOut);
            const searchResult: FlightFromService[][] = await axios.get<[FlightFromService[]]>('/search-flights',
                { ...this.getAuthHeader(), params: formData }
            ).then(response => response.data)
            if (searchResult.length < 2 || (searchResult[0].length === 0 && searchResult[1].length === 0)) {
                Swal.fire('No Results', 'No flights found for the selected criteria', 'info');
                return;
            }
            return searchResult;
        } catch (err: any) {
            if (err?.response?.status === 401 || err?.response?.status === 404) {
                return await ServiceLocator.authService.handleUnAuthError<[FlightFromService[]]>(err).then(response => response?.data)
            } else {
                this.handleHttpError(err);
            }
        }
    }
}