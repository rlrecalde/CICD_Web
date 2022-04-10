export interface Commit {

    id: string;
    branchId: number;
    committerLogin: string;
    committerName: string;
    date: Date;
    message: string;
}
