import ApiAxios from "./apiAxios";
import { Ports } from "./allPorts";
import Cookies from "js-cookie";

interface SessionData {
    txToken?: string;
    [key: string]: any;
}

export interface EndPointParams {
    accionBD: string;
    id?: string | number;
    body?: any;
    params?: Record<string, string | number | boolean>;
    isFormData?: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '';

export async function endPointBackend({ accionBD, id, body, params, isFormData }: EndPointParams ) {
    let serverName = "BackendService";
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
    const token = Cookies.get("token");

    headers = {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        "authorization": `${sessionData?.txToken || ''}`
    };

    headers = {
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
    };

    switch (accionBD) {
        // SERVICIOS USUARIOS
        case "Login": {
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/auth/login`;
            body = JSON.stringify(body);
            break;
        }

        case "Delete-User": {
            method = "DELETE";
            Url = `${urlIp}${urlPort}/v1.0/auth/delete/${id}`;
            break;
        }

        case "List-Users": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/auth/users`;
            break;
        }
        
        case "Update-User": {
            method = "PUT";
            Url = `${urlIp}${urlPort}/v1.0/auth/update/${id}`;
            body = JSON.stringify(body);
            break;
        }

        case "Create-User": {
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/auth/create`;
            body = JSON.stringify(body);
            break;
        }

        case "List-Usuarios": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/auth/asignables`;
            body = JSON.stringify(body);
            break;
        }
        
        

        // SERVICIOS PROSPECTOS
        case "Upload-Prospects": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/uploads`;
            break;
        }

        case "Create-Prospect": {
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/prospects/create`;
            body = JSON.stringify(body);
            break;
        }

        case "Total-Prospects": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/count`;
            break;
        }

        case "Genders-Chart": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/genders/chart`;
            break;
        }

        case "Historico-Prospects-Chart": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/historico/chart`;
            break;
        }

        case "Canales-Prospects-Chart": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/canales/chart`;
            break;
        }

        case "Prospects-By-Departments": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/departments`;
            break;
        }

        case "Prospects-By-Localities": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/localities`;
            break;
        }

        case "List-Prospects": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/list`;
            break;
        }

        case "Prospects-Birthdays": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/birthdays`;
            body = JSON.stringify(body);
            break;
        }

        case "Create-Upload-Prospect": {
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/prospects/upload`;
            body = JSON.stringify(body);
            break;
        }
        
        case "Delete-Prospect": {
            method = "DELETE";
            Url = `${urlIp}${urlPort}/v1.0/prospects/delete/${id}`;
            break;
        }
        
        case "Range-Age": {
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/prospects/age-ranges`;
            break;
        }


        // SERVICIOS EVENTOS
        case "Total-Events": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/events/count`;
            break;
        }

        case "List-Events": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/events/list`;
            break;
        }

        case "Create-Events": {  
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/events/create`;
            body = JSON.stringify(body);
            break;
        }

        case "Update-Events": {  
            method = "PUT";
            Url = `${urlIp}${urlPort}/v1.0/events/update/${id}`;
            body = JSON.stringify(body);
            break;
        }

        // SERVICIOS DIFUSIONES
        case "Recent-Broadcast": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/broadcasts/recent`;
            break;
        }



        // SERVICIOS SOLICITUDES
        case "List-Solictudes": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/solicitud/list`;
            break;
        }

        case "Create-Solicitud": {
            method = "POST";
            Url = `${urlIp}${urlPort}/v1.0/solicitud/create`;
            body = JSON.stringify(body);
            break;
        }

        case "Update-Solicitud": {
            method = "PUT";
            Url = `${urlIp}${urlPort}/v1.0/solicitud/${id}/update`;
            body = JSON.stringify(body);
            break;
        }

        case "Delete-Solicitud": {  
            method = "DELETE";
            Url = `${urlIp}${urlPort}/v1.0/solicitud/${id}/delete`;
            break;
        }

        case "Get-Solicitud": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/solicitud/${id}/consulta`;
            break;
        }

        // SEVICIOS CATALOGOS
        case "List-Genders": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/genders`;
            break;
        }

        case "List-Departments": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/departments`;
            break;
        }

        case "List-Municipalities": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/municipalities`;
            break;
        }

        case "List-Localities": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/localities`;
            break;
        }

        case "List-Comunness": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/comunness`;
            break;
        }
       
        case "List-Caneles-Comunication": {  
            method = "GET";
            Url = `${urlIp}${urlPort}/v1.0/catalogs/canales-comunication`;
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
