class Config {
    readonly FLIGHT_HTTP: string;
    readonly PAYMENT_HTTP: string;
    readonly PUSH_WS: string;
    readonly COUNTRIES_HTTP: string;

    constructor() {
        this.FLIGHT_HTTP = process.env.REACT_APP_FLIGHT_HTTP ?? ""
        this.PAYMENT_HTTP = process.env.REACT_APP_PAYMENT_HTTP ?? ""
        this.PUSH_WS = process.env.REACT_APP_PUSH_WS ?? ""
        this.COUNTRIES_HTTP = process.env.REACT_APP_COUNTRIES_HTTP ?? ""
    }
}

const config: Config = new Config()
export default config;