declare global {
    namespace NodeJS {
        interface ProcessEnv {
            AVATAR_API_URL: string;
            AVATAR_API_TOKEN: string;
        }
    }
}

export {};
