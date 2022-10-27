export type TStreamCreationStep = {
    id: number;
    label: string;
    method: Function;
}

export type TStreamOptionCreationSteps = {
    fromTokenAddress: string;
    toTokenAddress: string;
    steps: TStreamCreationStep[];
}