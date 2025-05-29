import ApiAxios from "./apiAxios";
import { Ports } from "./allPorts";


interface SessionData {
    txToken?: string;
    [key: string]: any;
}

export interface EndpointBotBackendParams {
    accionBD: string;
    id?: string | number;
    body?: any;
    params?: Record<string, string | number | boolean>;
    isFormData?: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '';

export async function endPointBotBackend({ accionBD, id, body, params, isFormData }: EndpointBotBackendParams ) {
    let serverName = "providerBotService";
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
        // SERVICIOS DEL BOT
        case "Envio-Numero": {
            method = "POST";
            Url = `${urlIp}/set-phone-number`;
            break;
        }
        case "Status-Conexion": {
            method = "GET";
            Url = `${urlIp}/bot-status`;
            break;
        }
        case "Status-Envio": {
            method = "POST"
            Url = `${urlIp}/broadcast-status`;
            break;
        }
        case "Envio-Difusion": {
            method = "GET"
            Url = `${urlIp}/upload`;
            break;
        }
         case "Reiniciar-Bot": {
            method = "GET"
            Url = `${urlIp}/restart-bot`;
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
