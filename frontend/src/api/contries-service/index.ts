import BaseService from "api/baseService";
import config from "config";

export class Country {
    name: string = "";
    code: string = "";
}

export default class CountriesService extends BaseService{
    private countries:Country[] = [];
    constructor() {
        super("CountriesService",config.COUNTRIES_HTTP);        
    }
    public async getCountriesList(): Promise<Country[]> {
        try{
            if(this.countries.length !== 0) return this.countries;
            this.countries = await this.axios.get<Country[]>("/countries").then(response => response.data); 
            return this.countries;
        }catch(err){
            this.handleHttpError(err);
            return [];
        }
            
    }

    public async getCountryByCode(code:string):Promise<Country>{
        return this.axios.get<Country>(`/countries/code/${code}`)
            .then(response => response.data)
    }

    public async getCountryByName(name:string):Promise<Country>{
        return this.axios.get<Country>(`/countries/name/${name}`)
        .then(response => response.data)
    }
}