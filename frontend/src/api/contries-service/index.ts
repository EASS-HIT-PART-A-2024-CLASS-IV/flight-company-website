import axios from "axios";
import config from "config";

export class Country {
    name: string = "";
    code: string = "";
}

export default class CountriesService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = config.COUNTRIES_HTTP
    }
    getCountriesList(): Promise<Country[]> {
        return axios.get<Country[]>(`${this.baseUrl}/countries`)
            .then(response => response.data)
    }

    getCountryByCode(code:string):Promise<Country>{
        return axios.get<Country>(`${this.baseUrl}/countries/code/${code}`)
            .then(response => response.data)
    }
    
    getCountryByName(name:string):Promise<Country>{
        return axios.get<Country>(`${this.baseUrl}/countries/name/${name}`)
        .then(response => response.data)
    }
}