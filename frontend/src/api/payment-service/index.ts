import BaseService from "api/baseService";
import ServiceLocator from "api/service.locator";
import config from "config";

export interface Payment{
    id:string;
    fullName:string;
    nameOnCard:string;
    cardNumber:string;
    dob:string;
    expiry:string;
    cvc:string;
    selectedFromSeat:string;
    selectedToSeat:string;
    amount:number;
    fromFlightNumber:string;
    toFlightNumber:string;
}

export default class PaymentService extends BaseService {
    constructor(){
        super('PaymentService',config.PAYMENT_HTTP)
    }
    public async pay(payment:Payment):Promise<boolean | undefined>{
        try {
            const res = await this.axios.post<boolean>('/pay',payment, this.getAuthHeader()).then(response => response.data)
            return res;
        } catch (err:any) {
            if (err?.response?.status === 401 || err?.response?.status === 404) {
                return await ServiceLocator.authService.handleUnAuthError<boolean>(err).then(response => response?.data)
            } else {
                this.handleHttpError(err);
            }
        }
        console.log(payment);
        
    }
}