export interface UserAttributes {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    mobile?: string;
}

export interface UserMeta {
    user_id: number;
    email: string;
}