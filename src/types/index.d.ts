declare module "ffmetadata" {
    export function read(file: string, callback: (err: any, data: any) => void);
    export function write(file: string, data: any, callback: (err: any) => void);
}

declare module "itunes-data" {
    export default {
        parser: () => any,
    };
}
