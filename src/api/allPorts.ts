interface PortsConfig {
        [key: string]: {
            url: string | undefined;
            port: string | undefined;
        } | {
        [key: string]: {
            [key: string]: string | undefined;
        };
    };
}

export const Ports: PortsConfig = {
    BackendService: {
        url:        process.env.NEXT_PUBLIC_DOMAIN_SERVER,
        port:       process.env.NEXT_PUBLIC_BACKEND_PORT
    },
    ProvidersSendService: {
        url:        process.env.NEXT_PUBLIC_PROVIDER_SERVER,
        port:       process.env.NEXT_PUBLIC_PROVIDER_SERVICE_PORT
    },
    ExternalServices: {
        policies: {
            MECIC: process.env.REACT_APP_DOMAIN_SERVER_API_POLICIES_MECIC,
            MERAC: process.env.REACT_APP_DOMAIN_SERVER_API_POLICIES_MERAC
        }
    }
};
