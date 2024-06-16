export interface UserAttributes {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    mobile?: string;
    is_superuser?: boolean
    reminder_enabled?: boolean;
    reminder_time?: number;
    reminder_method?: string
}

export interface UserMeta {
    id: number;
    email: string;
}