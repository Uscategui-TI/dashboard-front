import ApiAxios from "./apiAxios";
import { Ports } from "./allPorts";

interface SessionData {
    txToken?: string;
    [key: string]: any;
}

export interface SoftPointParams {
    accionBD: string;
    id?: string | number;
    body?: any;
    params?: Record<string, string | number | boolean>;
    isFormData?: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '';

export async function softPointBackend({ accionBD, id, body, params, isFormData }: SoftPointParams ) {
    let serverName = "ProvidersSendService";
    const jsonUrl = Ports;

    const serverConfig = jsonUrl[serverName];
    if (!serverConfig || typeof serverConfig !== 'object' || !('url' in serverConfig) || !('port' in serverConfig)) {
        throw new Error(`La configuración del servidor "${serverName}" es inválida o no está definida en 'Ports'.`);
    }

    let urlIp = jsonUrl[serverName].url;
    let urlPort = jsonUrl[serverName].port;
    let Url = "";
    let headers = {};
    let method: HttpMethod = "";

    const sessionData: SessionData = JSON.parse(localStorage.getItem("sessionData") || "{}");

    headers = {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        "authorization": `${sessionData?.txToken || ''}`
    };

    switch (accionBD) {
        // SERVICIOS CORREOS
        case "Send-Email": {
            method = "POST";
            Url = `${urlIp}${urlPort}/email/send-bulk`;
            break;
        }
        case "Send-Sms": {
            method = "POST";
            Url = `${urlIp}${urlPort}/sms/bulk`;
            break;
        }

        default:
            let response = {
                status: "404",
                message: "Accion a ejecutar no esta parametrizada...",
            };
            return response;
    }
    const self = new ApiAxios();
    let response = await self.sendRequest({ Url, method, body, headers, params  });
    return response.data;
}
