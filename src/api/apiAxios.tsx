import axios from "axios";

interface Request {
    Url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}

export default class ApiAxios {
    async sendRequest({ Url, method, body, headers, params }: Request) {
        const response = await axios({
            url: Url,
            method: method,
            data: body,
            headers: headers,
            params,
            timeout: 60000
        })
            .then((respuesta) => {
                return respuesta;
            })
            .catch((error) => {
                if (error.response) {
                    return error.response;
                }
                if (error?.code === "ERR_NETWORK") {
                    return {
                        data: "",
                        success: false,
                        status: "503",
                        message: error?.message,
                    };
                } else {
                    return {
                        data: "",
                        success: false,
                        status: error?.code,
                        message: error?.message,
                    };
                }
            });

        if (Boolean(response)) {

            switch (response?.status) {
                case 200:
                    return {
                        data: { ...response.data, severity: "susses"},
                        success: true,
                        status: response.status,
                    };
                case "201":
                    return {
                        data: { ...response.data, severity: "warn" },
                        success: true,
                        status: response.status,
                    };
                case "202":
                    return {
                        data: { ...response.data, severity: "warn" },
                        success: true,
                        status: response.status,
                    };
                case "400":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El servidor no pudo interpretar la solicitud dada una sintaxis inválida.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "401":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) Es necesario autenticar para obtener la respuesta solicitada.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "403":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El cliente no posee los permisos necesarios para este contenido.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "404":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El servidor no pudo encontrar el contenido solicitado.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "500":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El servidor ha encontrado una situación que no sabe cómo manejarla.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "501":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El método solicitado no está soportado por el servidor .`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "502":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El servidor obtuvo una respuesta inválida.`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "503":
                    return {
                        data: {
                            message: response?.data?.message || `Error (${response.status}) El servidor no está listo para manejar la petición, puede ser que el servidor está caído por mantenimiento o está sobrecargado`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                case "504":
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) El servidor no puede obtener una respuesta a tiempo`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
                default:
                    return {
                        data: {
                            codResponse: response.status,
                            message: response?.data?.message || `Error (${response.status}) inesperado en el consumo del servicio`,
                            severity: "error",
                            status: response.status,
                            success: false,
                        },
                        success: false,
                        status: response.status,
                    };
            }
        } else {
            return {
                data: {
                    codResponse: 999,
                    message: `Se perdio la conexion con el servidor...`,
                    severity: "error",
                    status: 999,
                },
                success: false,
                status: 999,
            };
        }
    }
}
