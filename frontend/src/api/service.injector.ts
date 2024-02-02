import CountriesService from "./contries-service"

class ServiceInjector{
    public static countriesService: CountriesService
    constructor(){
        ServiceInjector.countriesService = new CountriesService()
    }
}
export default ServiceInjector