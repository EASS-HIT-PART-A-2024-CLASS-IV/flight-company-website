import AuthService from "api/auth-service";
import ServiceLocator from "api/service.locator";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Swal from "sweetalert2";

export default class BaseService {
    protected axios: AxiosInstance;
    constructor(private serviceName: string, private baseURL: string) {
        this.axios = axios.create({ baseURL: this.baseURL })
    }

    protected handleHttpError(err: any,dontAlert?:boolean) {
        let error_message: string;
        if (err.response && err.response.data && err.response.data.detail) {
            error_message = err.response.data.detail
        } else {
            error_message = "An unexpected error occurred."
        }
        if(!dontAlert){
            Swal.fire('error', error_message, 'error');
        }
        console.log(`${this.serviceName}: ${error_message}`);
    }
    protected getAuthHeader(): AxiosRequestConfig {
        return {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('access')}`
            },
            baseURL: this.baseURL
        }
    }
    protected formatDate(dateString: string): string {
        const [month, day, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
}