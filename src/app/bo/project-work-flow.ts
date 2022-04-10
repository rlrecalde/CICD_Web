import { Branch } from "../dto/branch";
import { Project } from "../dto/project";
import { StatusType } from "./status-type.enum";
import { WorkFlowStep } from "./work-flow-step.enum";

export interface ProjectWorkFlow {

    project: Project;
    branches: Branch[];
    status: StatusType;
    step: WorkFlowStep;
    currentBranch: Branch;
}
