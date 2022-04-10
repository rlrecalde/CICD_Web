import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BranchStep } from 'src/app/bo/branch-step';
import { ProjectWorkFlow } from 'src/app/bo/project-work-flow';
import { StatusType } from 'src/app/bo/status-type.enum';
import { StepEvent } from 'src/app/bo/step-event';
import { WorkFlowStep } from 'src/app/bo/work-flow-step.enum';
import { Branch } from 'src/app/dto/branch';
import { Commit } from 'src/app/dto/commit';
import { Project } from 'src/app/dto/project';
import { ProjectToProjectWorkFlowPipe } from 'src/app/pipes/project-to-project-work-flow.pipe';
import { WorkFlowStepsService } from '../work-flow-steps/work-flow-steps.service';

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {

  private projectWorkFlows: ProjectWorkFlow[];

  @Output()
  statusEvent: EventEmitter<Map<number, StatusType>> = new EventEmitter<Map<number, StatusType>>();

  @Output()
  stepEvent: EventEmitter<BranchStep> = new EventEmitter<BranchStep>();

  @Output()
  branchesEvent: EventEmitter<Map<number, Branch[]>> = new EventEmitter<Map<number, Branch[]>>();

  @Output()
  lastCommitEvent: EventEmitter<Map<number, Commit>> = new EventEmitter<Map<number, Commit>>();

  @Output()
  warningEvent: EventEmitter<Map<number, string>> = new EventEmitter<Map<number, string>>();

  constructor(private projectToprojectWorkFlow: ProjectToProjectWorkFlowPipe,
              private workFlowStepsService: WorkFlowStepsService) {

    this.projectWorkFlows = [];

    this.workFlowStepsService.stepEvent.subscribe(
      (data) => this.stepEventReceived(data, this)
    );
    this.workFlowStepsService.stepOkEvent.subscribe(
      (data) => this.stepOkEventReceived(data, this)
    );
    this.workFlowStepsService.stepErrorEvent.subscribe(
      (data) => this.stepErrorEventReceived(data, this)
    );
    this.workFlowStepsService.statusEvent.subscribe(
      (data) => this.statusEventReceived(data, this)
    );
    this.workFlowStepsService.warningEvent.subscribe(
      (data) => this.warningEventReceived(data, this)
    );
  }

  run(project: Project, branches: Branch[]): void {

    let projectWorkFlow: ProjectWorkFlow = this.getProjectWorkFlowByProjectId(project);

    if (projectWorkFlow == null) {

      projectWorkFlow = this.projectToprojectWorkFlow.transform(project);
      this.projectWorkFlows.push(projectWorkFlow);
    }

    projectWorkFlow.branches = branches;
    projectWorkFlow.status = StatusType.Running;
    this.sendStatusEvent(projectWorkFlow, this);

    projectWorkFlow.step = WorkFlowStep.GetBranches;
    this.workFlowStepsService.execute(projectWorkFlow);
  }

  stop(project: Project): void {

    let projectWorkFlow: ProjectWorkFlow = this.getProjectWorkFlowByProjectId(project);
    projectWorkFlow.status = StatusType.Stopping;

    this.sendStatusEvent(projectWorkFlow, this);
    this.workFlowStepsService.stop(projectWorkFlow);
  }

  private stepEventReceived(projectWorkFlow: ProjectWorkFlow, self: WorkFlowService): void {

    const branchStep: BranchStep = {

      projectId: projectWorkFlow.project.id,
      branch: projectWorkFlow.currentBranch,
      workFlowStep: projectWorkFlow.step,
      finished: false,
    };

    self.stepEvent.emit(branchStep);
  }

  private stepOkEventReceived(stepEvent: StepEvent, self: WorkFlowService): void {

    if (stepEvent.projectWorkFlow.step == WorkFlowStep.GetBranches) {

      const event: Map<number, Branch[]> = new Map<number, Branch[]>();
      event.set(stepEvent.projectWorkFlow.project.id, stepEvent.data);

      self.branchesEvent.emit(event);
      return;
    } 
    
    if (stepEvent.projectWorkFlow.step == WorkFlowStep.GetLastCommit) {

      const event: Map<number, Commit> = new Map<number, Commit>();
      event.set(stepEvent.projectWorkFlow.project.id, stepEvent.data);

      self.lastCommitEvent.emit(event);
      return;
    }

    const branchStep: BranchStep = {

      projectId: stepEvent.projectWorkFlow.project.id,
      branch: stepEvent.projectWorkFlow.currentBranch,
      workFlowStep: stepEvent.projectWorkFlow.step,
      finished: true,
    };

    self.stepEvent.emit(branchStep);
  }

  private stepErrorEventReceived(stepEvent: StepEvent, self: WorkFlowService): void {
    
    const httpErrorResponse: HttpErrorResponse = stepEvent.data;
    const errorMessage: string = self.getErrorMessage(httpErrorResponse);

    const branchStep: BranchStep = {

      projectId: stepEvent.projectWorkFlow.project.id,
      branch: stepEvent.projectWorkFlow.currentBranch,
      workFlowStep: stepEvent.projectWorkFlow.step,
      finished: true,
      errorMessage: errorMessage,
    };

    self.stepEvent.emit(branchStep);

    console.log(httpErrorResponse);
  }

  private statusEventReceived(event: Map<number, StatusType>, self: WorkFlowService): void {

    self.statusEvent.emit(event);
  }

  private warningEventReceived(stepEvent: StepEvent, self: WorkFlowService): void {

      const event: Map<number, string> = new Map<number, string>();
      event.set(stepEvent.projectWorkFlow.project.id, stepEvent.data);

      self.warningEvent.emit(event);
  }

  private getProjectWorkFlowByProjectId(project: Project): ProjectWorkFlow {

    const aProjectWorkFlow: ProjectWorkFlow[] = this.projectWorkFlows.filter(x => x.project.id == project.id);

    if (aProjectWorkFlow.length > 0) {

      const projectWorkflow: ProjectWorkFlow = aProjectWorkFlow[0];
      projectWorkflow.project.dotnetVersion = project.dotnetVersion;
      projectWorkflow.project.test = project.test;
      projectWorkflow.project.deploy = project.deploy;
      projectWorkflow.project.deployPort = project.deployPort;

      return projectWorkflow;
    }
    
    return null;
  }

  private sendStatusEvent(projectWorkFlow: ProjectWorkFlow, self: WorkFlowService): void {

    let event: Map<number, StatusType> = new Map<number, StatusType>();
    event.set(projectWorkFlow.project.id, projectWorkFlow.status);

    self.statusEvent.emit(event);
  }

  private getErrorMessage(httpErrorResponse: HttpErrorResponse): string {

    let errorMessage = httpErrorResponse.message;
    if (httpErrorResponse.error && httpErrorResponse.error.message) {
      errorMessage = httpErrorResponse.error.message;
    }

    if (httpErrorResponse.status == 400) {
      
      errorMessage = `Bad Request: ${errorMessage}`;
    } else if (httpErrorResponse.status == 409) {
      
      errorMessage = `Entity already exists: ${errorMessage}`;
    } else if (httpErrorResponse.status == 404) {
      
      errorMessage = `Not Found: ${errorMessage}`;
    }

    return errorMessage;
  }
}
