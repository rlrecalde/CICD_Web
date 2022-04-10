import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BranchStep } from 'src/app/bo/branch-step';
import { StatusType } from 'src/app/bo/status-type.enum';
import { WorkFlowStep } from 'src/app/bo/work-flow-step.enum';
import { Branch } from 'src/app/dto/branch';
import { Commit } from 'src/app/dto/commit';
import { Project } from 'src/app/dto/project';
import { WorkFlowStepPipe } from 'src/app/pipes/work-flow-step.pipe';
import { BranchService } from 'src/app/services/api/branch/branch.service';
import { CommitService } from 'src/app/services/api/commit/commit.service';
import { WorkFlowService } from 'src/app/services/work-flow/work-flow.service';
import { ProjectService } from 'src/app/services/api/project/project.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProjectComponent } from '../edit-project/edit-project.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, DoCheck {

  private iconClasses: Map<StatusType, string>
  private branches: Branch[];

  description: string;
  status: StatusType;
  oldStatus: StatusType;
  iconClass: string;
  branchSteps: BranchStep[];
  delayedCommits: Commit[];
  warningMessage: string;

  @Input()
  project: Project;

  @Input()
  loading: boolean;

  @Output()
  removedProjectEvent: EventEmitter<Project> = new EventEmitter<Project>();

  @Output()
  loadingEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  errorEvent: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();
  
  constructor(private workFlowService: WorkFlowService,
              private workFlowStep: WorkFlowStepPipe,
              private branchService: BranchService,
              private commitService: CommitService,
              private projectService: ProjectService,
              private matDialog: MatDialog) {

    this.description = '...';
    this.status = StatusType.Stopped;
    this.oldStatus = StatusType.Stopped;
    this.iconClass = 'red-icon';
    this.branches = [];
    this.branchSteps = [];
    this.delayedCommits = [];

    this.iconClasses = new Map<StatusType, string>();
    this.iconClasses.set(StatusType.Stopped, 'red-icon');
    this.iconClasses.set(StatusType.Stopping, 'gray-icon');
    this.iconClasses.set(StatusType.Running, 'green-icon');

    this.workFlowService.statusEvent.subscribe(
      (data) => this.statusEventReceived(data, this)
    );
    this.workFlowService.stepEvent.subscribe(
      (data) => this.stepEventReceived(data, this)
    );
    this.workFlowService.branchesEvent.subscribe(
      (data) => this.branchesEventReceived(data, this)
    );
    this.workFlowService.lastCommitEvent.subscribe(
      (data) => this.lastCommitEventReceived(data, this)
    );
    this.workFlowService.warningEvent.subscribe(
      (data) => this.warningEventReceived(data, this)
    );
  }

  ngOnInit(): void {

    this.getBranches();
  }

  ngDoCheck(): void {
    
    if (this.status === this.oldStatus)
      return;

    this.iconClass = this.iconClasses.get(this.status);
    this.oldStatus = this.status;
  }

  runOrStop(): void {

    if (this.status == StatusType.Stopped) {

      this.workFlowService.run(this.project, this.getBranchesCopy(this.branchSteps));
      return;
    }

    if (this.status == StatusType.Running) {

      this.workFlowService.stop(this.project);
      return;
    }
  }

  edit(): void {

    const ref = this.matDialog.open(EditProjectComponent, {
      data: {
        projectId: this.project.id,
        name: this.project.name, 
        relativePath: this.project.relativePath,
        dotnetVersion: this.project.dotnetVersion,
        test: this.project.test,
        deploy: this.project.deploy,
        deployPort: this.project.deployPort,
        user: this.project.user
      }
    });

    ref.beforeClosed().subscribe(
      (data) => this.editCallback(data, this)
    );
  }

  remove(): void {

    const ref = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Project',
        content: `Are you sure you want to remove ${this.project.name}?`
      }
    });

    ref.beforeClosed().subscribe(
      (data) => this.removeCallback(data, this)
    );
  }

  private editCallback(project: Project, self: ProjectComponent): void {

    if (project == null)
      return;
    
    self.loadingEvent.emit(true);
    
    self.projectService.update(project).subscribe(
      (data) => self.updateProjectCallback(project, self),
      (error) => self.updateProjectError(error, self)
    );
  }

  private removeCallback(confirmed: boolean, self: ProjectComponent): void {

    if (!confirmed)
      return;

    self.loadingEvent.emit(true);

    self.projectService.delete(self.project.id).subscribe(
      (data) => self.deleteCallback(self.project, self),
      (error) => self.deleteError(error, self)
    );
  }

  private updateProjectCallback(project: Project, self: ProjectComponent): void {

    self.loadingEvent.emit(false);
    self.project = project;
  }

  private updateProjectError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private deleteCallback(project: Project, self: ProjectComponent): void {

    self.loadingEvent.emit(false);
    self.removedProjectEvent.emit(project);
  }

  private deleteError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private getBranches(): void {

    this.loadingEvent.emit(true);

    this.branchService.getByProjectId(this.project.id).subscribe(
      (data) => this.getBranchesCallback(data, this),
      (error) => this.getBranchesError(error, this)
    )
  }

  private getBranchesCallback(branches: Branch[], self: ProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.branches = branches;

    for (let branch of branches)
      self.getLastCommit(branch.id, self);
  }

  private getBranchesError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private getLastCommit(branchId: number, self: ProjectComponent): void {

    self.loadingEvent.emit(true);

    self.commitService.getLastCommitByBranchId(branchId).subscribe(
      (data) => self.getLastCommitCallback(data, self),
      (error) => self.getLastCommitError(error, self)
    )
  }

  private getLastCommitCallback(commit: Commit, self: ProjectComponent): void {

    self.loadingEvent.emit(false);

    const branch: Branch = self.branches.filter(x => x.id == commit.branchId)[0];
    branch.project = self.project;
    branch.lastCommit = {
      
      id: commit.id,
      branchId: commit.branchId,
      committerLogin: commit.committerLogin,
      committerName: commit.committerName,
      date: commit.date,
      message: commit.message,
    };

    const branchStep: BranchStep = {

      projectId: self.project.id,
      branch: branch,
      workFlowStep: WorkFlowStep.Finished,
      finished: true,
    }
    self.branchSteps.push(branchStep);
  }

  private getLastCommitError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {

    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private createBranches(branches: Branch[], self: ProjectComponent): void {

    self.branchService.createMany(branches).subscribe(
      (data) => self.createBranchesCallback(data, self),
      (error) => self.createBranchesError(error, self)
    );
  }

  private createBranchesCallback(branches: Branch[], self: ProjectComponent): void {

    for (let branch of branches) {

      const currentBranch: Branch = self.branchSteps.filter(x => x.branch.name == branch.name)[0].branch;
      currentBranch.id = branch.id;

      const commitIndex: number = self.delayedCommits.findIndex(x => x.id == currentBranch.lastCommit.id);
      if (commitIndex > -1) {

        const delayedCommit: Commit = self.delayedCommits[commitIndex];
        delayedCommit.branchId = branch.id;
        self.createCommit(delayedCommit, self);
        self.delayedCommits.splice(commitIndex, 0);
      }
    }
  }

  private createBranchesError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {

    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private deleteBranches(branches: Branch[], self: ProjectComponent): void {

    self.branchService.markManyAsDeleted(branches).subscribe(
      (data) => self.deleteBranchesCallback(self),
      (error) => self.deleteBranchesError(error, self)
    )
  }

  private deleteBranchesCallback(self: ProjectComponent): void {

  }

  private deleteBranchesError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {

    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private createCommit(commit: Commit, self: ProjectComponent): void {

    self.commitService.create(commit).subscribe(
      (data) => self.createCommitCallback(self),
      (error) => self.createCommitError(error, self)
    )
  }

  private createCommitCallback(self: ProjectComponent): void {

  }

  private createCommitError(httpErrorResponse: HttpErrorResponse, self: ProjectComponent): void {

    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private statusEventReceived(event: Map<number, StatusType>, self: ProjectComponent): void {

    if (!event.has(self.project.id))
      return;

    self.status = event.get(self.project.id);
  }

  private stepEventReceived(branchStep: BranchStep, self: ProjectComponent): void {

    if (branchStep.projectId !== self.project.id)
      return;

    self.description = '...';
    if (branchStep.workFlowStep == WorkFlowStep.GetBranches)
      self.description = 'Checking branches...';

    if (self.branchSteps.length == 0 || !branchStep.branch)
      return;

    let currentBranchStep: BranchStep = self.branchSteps.filter(x => x.branch.name == branchStep.branch.name)[0];
    currentBranchStep.workFlowStep = branchStep.workFlowStep;
    currentBranchStep.finished = branchStep.finished;
    currentBranchStep.errorMessage = branchStep.errorMessage;

    const step: string = self.workFlowStep.transform(branchStep.workFlowStep);
    const branch: string = currentBranchStep.branch.name;
    self.description = `Branch ${branch}: ${step}`;
  }

  private branchesEventReceived(event: Map<number, Branch[]>, self: ProjectComponent): void {

    if (!event.has(self.project.id))
      return;

    const branches: Branch[] = event.get(self.project.id);
    const branchesToCreate: Branch[] = self.getBranchesToCreate(branches, self);
    const branchesToDelete: Branch[] = self.getBranchesToDelete(branches, self);

    self.branchesToBranchSteps(branches, self);

    if (branchesToCreate.length > 0)
      self.createBranches(branchesToCreate, self);
    
    if (branchesToDelete.length > 0)
      self.deleteBranches(branchesToDelete, self);
  }

  private lastCommitEventReceived(event: Map<number, Commit>, self: ProjectComponent): void {

    if (!event.has(self.project.id))
      return;

    const lastCommit: Commit = event.get(self.project.id);
    const aBranchStep: BranchStep[] = self.branchSteps.filter(x => x.branch.lastCommit.id == lastCommit.id);

    if (aBranchStep.length == 0)
      return;

    const branch: Branch = aBranchStep[0].branch;
    branch.lastCommit.branchId = branch.id;
    branch.lastCommit.committerLogin = lastCommit.committerLogin;
    branch.lastCommit.committerName = lastCommit.committerName;
    branch.lastCommit.date = lastCommit.date;
    branch.lastCommit.message = lastCommit.message;

    if (branch.id == 0) {

      self.delayedCommits.push(lastCommit);
      return;
    }

    lastCommit.branchId = branch.id;
    self.createCommit(lastCommit, self);
  }

  private warningEventReceived(event: Map<number, string>, self: ProjectComponent): void {

    if (!event.has(self.project.id))
      return;

    self.warningMessage = event.get(self.project.id);
  }

  private getBranchesToCreate(receivedBranches: Branch[], self: ProjectComponent): Branch[] {

    const currentBranches: Branch[] = self.branchSteps.map<Branch>(x => x.branch);
    const branchesToCreate: Branch[] = receivedBranches.filter(x => !(currentBranches.filter(y => y.name == x.name).length > 0));

    return branchesToCreate;
  }

  private getBranchesToDelete(receivedBranches: Branch[], self: ProjectComponent): Branch[] {

    const currentBranches: Branch[] = self.branchSteps.map<Branch>(x => x.branch);
    const branchesToDelete: Branch[] = currentBranches.filter(x => !(receivedBranches.filter(y => y.name == x.name).length > 0));

    return branchesToDelete;
  }

  private branchesToBranchSteps(branches: Branch[], self: ProjectComponent): void {

    for (let branch of branches) {

      const branchStepIndex: number = self.branchSteps.findIndex(x => x.branch.name == branch.name);

      if (branchStepIndex == -1) {

        const branchStep: BranchStep = self.branchToBranchStep(branch, self);
        self.branchSteps.push(branchStep);
        continue;
      }

      self.branchSteps[branchStepIndex].branch.lastCommit.id = branch.lastCommit.id;
    }

    const deletedBranches: BranchStep[] = self.branchSteps.filter(x => !(branches.filter(y => y.name == x.branch.name).length > 0));

    for (let deletedBranch of deletedBranches) {

      const branchIndex: number = self.branchSteps.findIndex(x => x.branch.name == deletedBranch.branch.name);
      self.branchSteps.splice(branchIndex, 1);
    }
  }

  private branchToBranchStep(branch: Branch, self: ProjectComponent): BranchStep {

    const branchStep: BranchStep = {

      projectId: self.project.id,
      branch: {
        id: branch.id,
        name: branch.name,
        lastCommit: {
          id: branch.lastCommit.id,
          branchId: 0,
          committerName: null,
          committerLogin: null,
          date: null,
          message: null,
        },
        project: branch.project,
      },
      workFlowStep: WorkFlowStep.None,
      finished: false,
    };

    return branchStep;
  }

  private getBranchesCopy(branchSteps: BranchStep[]): Branch[] {

    const branches: Branch[] = [];

    for (let branchStep of branchSteps) {

      const branch: Branch = {
        id: branchStep.branch.id,
        name: branchStep.branch.name,
        lastCommit: {
          id: branchStep.branch.lastCommit.id,
          branchId: branchStep.branch.id,
          committerName: branchStep.branch.lastCommit.committerName,
          committerLogin: branchStep.branch.lastCommit.committerLogin,
          date: branchStep.branch.lastCommit.date,
          message: branchStep.branch.lastCommit.message,
        },
        project: branchStep.branch.project
      };

      branches.push(branch);
    }

    return branches;
  }
}
