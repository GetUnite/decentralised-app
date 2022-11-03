export type TStreamCreationStep = {
    id: number;
    label: string;
}

export type TStreamOptionCreationSteps = {
    fromTokenAddress: string;
    toTokenAddress: string;
    steps: TStreamCreationStep[];
}