export interface OptionsTreeData {
    key: string;
    label: string;
    children?: Children[];
    class: Class;
}

export interface Children {
    key: string;
    label: string;
    class?: Class;
    children?: Children2[];
}

export interface Class {
    name: string;
}

export interface Children2 {
    key: string;
    label: string;
}
