import { Branch } from "../dto/branch";
import { WorkFlowStep } from "./work-flow-step.enum";

export interface BranchStep {

    projectId: number;
    branch: Branch;
    workFlowStep: WorkFlowStep;
    finished: boolean;
    errorMessage?: string;
}
