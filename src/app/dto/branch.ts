import { Commit } from "./commit";
import { Project } from "./project";

export interface Branch {

    id: number;
    name: string;
    lastCommit: Commit;
    project: Project;
}
