import BaseService from "api/baseService";
import { AxiosError, AxiosResponse } from "axios";
import config from "config";

export interface User {
    username: string;
    password: string;
    role?: "user" | "admin";
}

export interface UserCreds {
    username: string;
    password: string;
}

export interface SessionTokens {
    access_token: string;
    refresh_token: string;
    role: 'user' | 'admin';
}


export default class AuthService extends BaseService {
    constructor() {
        super("AuthService", config.AUTH_HTTP)
    }
    public async register(user: User): Promise<string | null> {
        try {
            const response = await this.axios.post<any>('/register', user);
            return response.data.message;
        } catch (err: any) {
            this.handleHttpError(err)
            return null
        }
    }

    public async login(user: UserCreds): Promise<SessionTokens | null> {
        try {
            const response = await this.axios.post<SessionTokens>('/token', user);
            const tokens: SessionTokens = response.data;
            this.saveInSessionStrorage(tokens);
            return tokens;
        } catch (err: any) {
            this.handleHttpError(err);
            return null;
        }
    }
    public async handleUnAuthError<T>(err: AxiosError): Promise<AxiosResponse<T,any> | undefined> {
        const sessionTokens = this.getSessionData()
        if (sessionTokens == null) {
            this.clearSession();
            window.location.href = '/';
            return;
        }
        const refresh_token = sessionTokens.refresh_token;
        // falid to get new creds
        if ((await this.refresh(refresh_token)) === false) return;

        try {
            // Once session is refreshed, retry the failed request
            const newRequestConfig = { ...err.config, ...this.getAuthHeader() };
            return this.axios(newRequestConfig)
        } catch (err) {
            console.log(err);
            
            this.handleHttpError(err)
        }

    }
    private async refresh(refresh_token: string): Promise<boolean> {
        try {
            const sessionTokens = await this.axios.post<SessionTokens>('/token/refresh', undefined, {
                params: {
                    refresh_token
                }
            }).then(response => response.data).then(this.saveInSessionStrorage)
            return sessionTokens != null;
        } catch (err) {
            this.handleHttpError(err,true);
            this.clearSession();
            window.location.href = '/';
            return false;
        }
    }
    private saveInSessionStrorage(sessionTokens: SessionTokens): SessionTokens {
        sessionStorage.setItem('role', sessionTokens.role);
        sessionStorage.setItem('access', sessionTokens.access_token);
        sessionStorage.setItem('refresh', sessionTokens.refresh_token);

        return sessionTokens;
    }

    public getSessionData(): SessionTokens | null {
        if (['role', 'refresh', 'access'].every((key: string) => sessionStorage.getItem(key)) === false) return null;

        return {
            role: sessionStorage.getItem('role') === 'admin' ? 'admin' : 'user',
            refresh_token: sessionStorage.getItem('refresh') ?? '',
            access_token: sessionStorage.getItem('access') ?? ''
        };
    }

    public clearSession(): void {
        sessionStorage.clear()
    }
}