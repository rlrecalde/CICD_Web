import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectWorkFlow } from 'src/app/bo/project-work-flow';
import { WorkFlowStep } from 'src/app/bo/work-flow-step.enum';
import { DotnetService } from '../api/dotnet/dotnet.service';
import { GitHubService } from '../api/git-hub/git-hub.service';
import { GitService } from '../api/git/git.service';
import { Branch } from 'src/app/dto/branch';
import { StepEvent } from 'src/app/bo/step-event';
import { Commit } from 'src/app/dto/commit';
import { Comment } from 'src/app/dto/comment';
import { StatusType } from 'src/app/bo/status-type.enum';
import { ConfigService } from '../config/config.service';
import { ShellService } from '../api/shell/shell.service';

@Injectable({
  providedIn: 'root'
})
export class WorkFlowStepsService {

  private steps: Map<WorkFlowStep, (projectWorkflow: ProjectWorkFlow, self: WorkFlowStepsService) => void>;
  private branchesToWorkOn: Map<number, Branch[]> = new Map<number, Branch[]>();
  private workFlowsToStop: Set<number> = new Set<number>();

  @Output()
  stepEvent: EventEmitter<ProjectWorkFlow> = new EventEmitter<ProjectWorkFlow>();

  @Output()
  stepOkEvent: EventEmitter<StepEvent> = new EventEmitter<StepEvent>();

  @Output()
  stepErrorEvent: EventEmitter<StepEvent> = new EventEmitter<StepEvent>();

  @Output()
  statusEvent: EventEmitter<Map<number, StatusType>> = new EventEmitter<Map<number, StatusType>>();

  @Output()
  warningEvent: EventEmitter<StepEvent> = new EventEmitter<StepEvent>();

  constructor(private gitService: GitService,
              private gitHubService: GitHubService,
              private dotnetService: DotnetService,
              private configService: ConfigService,
              private shellService: ShellService) {

    this.steps = new Map<WorkFlowStep, (projectWorkflow: ProjectWorkFlow, self: WorkFlowStepsService) => void>();
    this.steps.set(WorkFlowStep.GetBranches, this.getBranches);
    this.steps.set(WorkFlowStep.GetLastCommit, this.getLastCommit);
    this.steps.set(WorkFlowStep.Fetch, this.fetch);
    this.steps.set(WorkFlowStep.SwitchBranch, this.switchBranch);
    this.steps.set(WorkFlowStep.PullBranch, this.pullBranch);
    this.steps.set(WorkFlowStep.BuildProject, this.buildProject);
    this.steps.set(WorkFlowStep.SendBuildComment, this.sendBuildComment);
    this.steps.set(WorkFlowStep.TestProject, this.testProject);
    this.steps.set(WorkFlowStep.SendTestComment, this.sendTestComment);
    this.steps.set(WorkFlowStep.GetHeadBranch, this.getHeadBranch);
    this.steps.set(WorkFlowStep.Deploy, this.deploy);
    this.steps.set(WorkFlowStep.Finished, this.finish);
  }

  execute(projectWorkFlow: ProjectWorkFlow): void {

    this.nextStep(projectWorkFlow, this);
  }

  stop(projectWorkFlow: ProjectWorkFlow): void {

    this.workFlowsToStop.add(projectWorkFlow.project.id);
  }

  // Steps

  private getBranches(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.gitHubService.getBranches(projectWorkFlow.project).subscribe(
      (data) => self.getBranchesCallback(data, projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private getLastCommit(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.gitHubService.getlastCommit(projectWorkFlow.currentBranch).subscribe(
      (data) => self.getLastCommitCallback(data, projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private fetch(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);

    self.gitService.fetch(projectWorkFlow.project).subscribe(
      (data) => self.fetchCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    )
  }

  private switchBranch(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.gitService.switch(projectWorkFlow.currentBranch).subscribe(
      (data) => self.switchBranchCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private pullBranch(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.gitService.pull(projectWorkFlow.project).subscribe(
      (data) => self.pullBranchCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private buildProject(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.dotnetService.build(projectWorkFlow.project).subscribe(
      (data) => self.buildProjectCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private sendBuildComment(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    const comment: Comment = {

      branch: projectWorkFlow.currentBranch,
      text: 'Build Ok!',
    };

    self.gitHubService.sendComment(comment).subscribe(
      (data) => self.sendBuildCommentCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private testProject(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.dotnetService.test(projectWorkFlow.project).subscribe(
      (data) => self.testProjectCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private sendTestComment(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    const comment: Comment = {

      branch: projectWorkFlow.currentBranch,
      text: 'Test Ok!',
    };

    self.gitHubService.sendComment(comment).subscribe(
      (data) => self.sendTestCommentCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private getHeadBranch(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.gitService.getHeadBranch(projectWorkFlow.project).subscribe(
      (data) => self.getHeadBranchCallback(data, projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private deploy(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.stepEvent.emit(projectWorkFlow);
    
    self.shellService.dockerize(projectWorkFlow.project).subscribe(
      (data) => self.deployCallback(projectWorkFlow, self),
      (error) => self.stepError(error, projectWorkFlow, self)
    );
  }

  private finish(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);

    self.checkNextBranchAndContinue(projectWorkFlow, self);
  }

  // End Steps

  private nextStep(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const step = self.steps.get(projectWorkFlow.step);
    step.call(self, projectWorkFlow, self);
  }

  // Step Callbacks

  private getBranchesCallback(branches: Branch[], projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    branches = self.checkBranches(branches, projectWorkFlow, self);

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: branches,
    };

    self.stepOkEvent.emit(stepEvent);

    const branchesToPull: Branch[] = self.getBranchesToPull(projectWorkFlow.branches, branches);
    self.setProjectWorkFlowBranches(projectWorkFlow, branches);

    let nextStep: WorkFlowStep = WorkFlowStep.Finished;
    if (branchesToPull.length > 0) {

      self.branchesToWorkOn.set(projectWorkFlow.project.id, branchesToPull);
      projectWorkFlow.currentBranch = branchesToPull[0];
      projectWorkFlow.currentBranch.project = projectWorkFlow.project;
      nextStep = projectWorkFlow.step + 1;
    }

    projectWorkFlow.step = nextStep;
    self.nextStep(projectWorkFlow, self);
  }

  private getLastCommitCallback(lastCommit: Commit, projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: lastCommit,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private fetchCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private switchBranchCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private pullBranchCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private buildProjectCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private sendBuildCommentCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    if (projectWorkFlow.project.test == false) {

      projectWorkFlow.step = WorkFlowStep.GetHeadBranch;
      if (projectWorkFlow.project.deploy == false) {

        projectWorkFlow.step = WorkFlowStep.Finished;
      }
    }

    self.nextStep(projectWorkFlow, self);
  }

  private testProjectCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    self.nextStep(projectWorkFlow, self);
  }

  private sendTestCommentCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step++;
    if (projectWorkFlow.project.deploy == false) {

      projectWorkFlow.step = WorkFlowStep.Finished;
    }

    self.nextStep(projectWorkFlow, self);
  }

  private getHeadBranchCallback(headBranch: Branch, projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);

    projectWorkFlow.step++;
    if (headBranch.name != projectWorkFlow.currentBranch.name) {

      projectWorkFlow.step = WorkFlowStep.Finished;
    }

    self.nextStep(projectWorkFlow, self);
  }

  private deployCallback(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: null,
    };

    self.stepOkEvent.emit(stepEvent);
    
    projectWorkFlow.step = WorkFlowStep.Finished;
    self.nextStep(projectWorkFlow, self);
  }

  private stepError(httpErrorResponse: HttpErrorResponse, projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {
    
    const stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: httpErrorResponse,
    };

    self.stepErrorEvent.emit(stepEvent);

    self.checkNextBranchAndContinue(projectWorkFlow, self);
  }

  // End Step Callbacks

  private checkNextBranchAndContinue(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    const branchesToPull: Branch[] = self.branchesToWorkOn.get(projectWorkFlow.project.id);

    if (branchesToPull && branchesToPull.length > 0)
      branchesToPull.splice(0, 1);

    if (!branchesToPull || branchesToPull.length == 0) {

      self.wait(projectWorkFlow, self);
      return;
    }

    projectWorkFlow.currentBranch = branchesToPull[0];
    projectWorkFlow.currentBranch.project = projectWorkFlow.project;
    projectWorkFlow.step = WorkFlowStep.GetLastCommit;
    self.nextStep(projectWorkFlow, self);
  }

  private wait(projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): void {

    self.sleep(1000 * self.configService.configSettings.gitHubPollingTimeSecs).then(() => {

      projectWorkFlow.currentBranch = null;
      self.branchesToWorkOn.delete(projectWorkFlow.project.id);

      if (self.workFlowsToStop.has(projectWorkFlow.project.id)) {

        const event: Map<number, StatusType> = new Map<number, StatusType>();
        event.set(projectWorkFlow.project.id, StatusType.Stopped);

        self.statusEvent.emit(event);

        self.workFlowsToStop.delete(projectWorkFlow.project.id);
        return;
      }

      projectWorkFlow.step = WorkFlowStep.GetBranches;
      self.nextStep(projectWorkFlow, self);
    });
  }

  private getBranchesToPull(currentBranches: Branch[], branches: Branch[]): Branch[] {

    const branchesToPull: Branch[] = [];

    for (let index = 0; index < branches.length; index++) {

      const aCurrentBranch = currentBranches.filter(x => x.name == branches[index].name);

      if (aCurrentBranch.length == 0) {

        branchesToPull.push(branches[index]);
        continue;
      }

      const currentBranch: Branch = aCurrentBranch[0];

      if (currentBranch.lastCommit.id != branches[index].lastCommit.id)
        branchesToPull.push(branches[index]);
    }

    return branchesToPull;
  }

  private setProjectWorkFlowBranches(projectWorkFlow: ProjectWorkFlow, branches: Branch[]): void {

    for (let index = 0; index < branches.length; index++) {

      const branchIndex: number = projectWorkFlow.branches.findIndex(x => x.name == branches[index].name);

      if (branchIndex == -1) {

        const branch: Branch = {

          id: 0,
          name: branches[index].name,
          lastCommit: {

            id: branches[index].lastCommit.id,
            branchId: branches[index].id,
            committerName: null,
            committerLogin: null,
            date: null,
            message: null
          },
          project: null,
        };

        projectWorkFlow.branches.push(branch);
        continue;
      }

      projectWorkFlow.branches[branchIndex].lastCommit.id = branches[index].lastCommit.id;
    }

    const deletedBranches: Branch[] = projectWorkFlow.branches.filter(x => !(branches.filter(y => y.name == x.name).length > 0));

    for (let index = 0; index < deletedBranches.length; index++) {

      const branchIndex: number = projectWorkFlow.branches.findIndex(x => x.name == deletedBranches[index].name);
      projectWorkFlow.branches.splice(branchIndex, 1);
    }
  }

  private checkBranches(branches: Branch[], projectWorkFlow: ProjectWorkFlow, self: WorkFlowStepsService): Branch[] {

    const branchesToReturn: Branch[] = [];
    const branchesWithConflicts: Branch[] = [];

    for (let branch of branches) {

      if (branchesToReturn.filter(x => x.lastCommit.id == branch.lastCommit.id).length > 0) {
        
        branchesWithConflicts.push(branch);
        continue;
      }

      branchesToReturn.push(branch);
    }

    let stepEvent: StepEvent = {

      projectWorkFlow: projectWorkFlow,
      data: '',
    };

    if (branchesWithConflicts.length > 0)
      stepEvent.data = 'Some branches were discarded because of commits issues';

    self.warningEvent.emit(stepEvent);

    return branchesToReturn;
  }

  private sleep(time: number): Promise<any> {

    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
