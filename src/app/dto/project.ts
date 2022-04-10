import { User } from "./user";

export interface Project {

    id: number;
    user: User;
    name: string;
    relativePath: string;
    dotnetVersion: string;
    test: boolean;
    deploy: boolean;
    deployPort: number;
}
