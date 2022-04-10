import { Pipe, PipeTransform } from '@angular/core';
import { WorkFlowStep } from '../bo/work-flow-step.enum';

@Pipe({
  name: 'workFlowStep'
})
export class WorkFlowStepPipe implements PipeTransform {

  private workFlowSteps: Map<WorkFlowStep, string>;

  constructor() {

    this.workFlowSteps = new Map<WorkFlowStep, string>();
    this.workFlowSteps.set(WorkFlowStep.GetBranches, 'Checking for changes...');
    this.workFlowSteps.set(WorkFlowStep.GetLastCommit, 'Checking for changes...');
    this.workFlowSteps.set(WorkFlowStep.Fetch, 'Fetching...');
    this.workFlowSteps.set(WorkFlowStep.SwitchBranch, 'Pulling...');
    this.workFlowSteps.set(WorkFlowStep.PullBranch, 'Pulling...');
    this.workFlowSteps.set(WorkFlowStep.BuildProject, 'Building...');
    this.workFlowSteps.set(WorkFlowStep.SendBuildComment, 'Building...');
    this.workFlowSteps.set(WorkFlowStep.TestProject, 'Testing...');
    this.workFlowSteps.set(WorkFlowStep.SendTestComment, 'Testing...');
    this.workFlowSteps.set(WorkFlowStep.GetHeadBranch, 'Deploying...');
    this.workFlowSteps.set(WorkFlowStep.Deploy, 'Deploying...');
    this.workFlowSteps.set(WorkFlowStep.Finished, 'Up To Date!');
  }

  transform(value: WorkFlowStep, ...args: any[]): string {
    
    return this.workFlowSteps.get(value);
  }
}
