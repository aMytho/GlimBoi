/**
 * A request made to the Glimboi API
 */
export interface ApiRequest {
    href: string;
    method: string;
    body: any;
}