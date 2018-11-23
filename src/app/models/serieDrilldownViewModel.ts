export class SerieDrilldownViewModel {
    id: string;
    colorByPoint: boolean;
    name: string;
    data: (string | number)[][];

    constructor(){
        this.data = [];
    }
}