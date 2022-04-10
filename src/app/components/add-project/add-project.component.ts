import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Project } from 'src/app/dto/project';
import { User } from 'src/app/dto/user';
import { ProjectService } from 'src/app/services/api/project/project.service';
import { GitService } from 'src/app/services/api/git/git.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DotnetService } from 'src/app/services/api/dotnet/dotnet.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {

  private project: Project;

  @ViewChild(MatExpansionPanel)
  panel: MatExpansionPanel;

  tryCloneEnable: boolean;

  name: string;
  relativePath: string;
  dotnetVersions: string[];
  dotnetVersion: string;
  test: boolean;
  deploy: boolean;
  deployPort: number;

  @Input()
  loading: boolean;

  @Input()
  user: User;

  @Output()
  loadingEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  errorEvent: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();

  @Output()
  addedProjectEvent: EventEmitter<Project> = new EventEmitter<Project>();

  constructor(private projectService: ProjectService,
              private gitService: GitService,
              private dotnetService: DotnetService) {

    this.tryCloneEnable = false;
    this.name = '';
    this.relativePath = '';
    this.dotnetVersion = '';
    this.test = false;
    this.deploy = false;
    this.deployPort = 0;
  }

  ngOnInit(): void {
  }

  opened(): void {

    this.getDotnetVersions();
  }

  addProject() {

    this.loadingEvent.emit(true);

    const project: Project = {

      id: 0,
      user: this.user,
      name: this.name,
      relativePath: this.relativePath,
      dotnetVersion: this.dotnetVersion,
      test: this.test,
      deploy: this.deploy,
      deployPort: this.deployPort,
    }

    this.projectService.create(project).subscribe(
      (data) => this.addProjectCallback(data, this),
      (error) => this.addProjectError(error, this)
    )
  }

  tryClone(): void {

    this.clone(this.project, this);
  }

  private getDotnetVersions(): void {

    this.loadingEvent.emit(true);

    this.dotnetService.getVersions().subscribe(
      (data) => this.getDotnetVersionsCallback(data, this),
      (error) => this.getDotnetVersionsError(error, this)
    )
  }

  private getDotnetVersionsCallback(dotnetVersions: string[], self: AddProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.dotnetVersions = dotnetVersions;
  }

  private getDotnetVersionsError(httpErrorResponse: HttpErrorResponse, self: AddProjectComponent): void {
    
    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private addProjectCallback(project: Project, self: AddProjectComponent): void {

    self.loadingEvent.emit(false);

    self.project = project;
    self.clone(project, self);
  }

  private addProjectError(httpErrorResponse: HttpErrorResponse, self: AddProjectComponent): void {

    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }

  private clone(project: Project, self: AddProjectComponent): void {

    self.loadingEvent.emit(true);

    self.gitService.clone(project).subscribe(
      (data) => self.cloneCallback(project, self),
      (error) => self.cloneError(error, self)
    );
  }

  private cloneCallback(project: Project, self: AddProjectComponent): void {

    self.loadingEvent.emit(false);
    self.addedProjectEvent.emit(project);

    self.name = '';
    self.relativePath = '';
    self.dotnetVersion = '';
    self.test = false;
    self.deploy = false;
    self.deployPort = 0;

    self.tryCloneEnable = false;
    self.panel.close();
  }

  private cloneError(httpErrorResponse: HttpErrorResponse, self: AddProjectComponent): void {

    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);
    self.tryCloneEnable = true;

    console.log(httpErrorResponse);
  }
}
