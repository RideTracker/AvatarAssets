export type Manifest = {
    type: string;

    colors: {
        type: string;
        defaultColor: string;
    }[];

    layers: {
        index: number;
        colorType?: string;
    }[];
};
