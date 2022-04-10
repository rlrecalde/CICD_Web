import { Pipe, PipeTransform } from '@angular/core';
import { ProjectWorkFlow } from '../bo/project-work-flow';
import { StatusType } from '../bo/status-type.enum';
import { WorkFlowStep } from '../bo/work-flow-step.enum';
import { Project } from '../dto/project';

@Pipe({
  name: 'projectToProjectWorkFlow'
})
export class ProjectToProjectWorkFlowPipe implements PipeTransform {

  transform(value: Project, ...args: unknown[]): ProjectWorkFlow {
    
    const projectWorkFlow: ProjectWorkFlow = {

      project: value,
      branches: [],
      status: StatusType.Stopped,
      step: WorkFlowStep.Finished,
      currentBranch: null,
    }

    return projectWorkFlow;
  }
}
