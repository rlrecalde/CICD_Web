import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from 'src/app/dto/project';
import { DotnetService } from 'src/app/services/api/dotnet/dotnet.service';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit, DoCheck {
  
  private oldRelativePath: string;
  private oldDotnetVersion: string;
  private oldTest: boolean;
  private oldDeploy: boolean;
  private oldDeployPort: number;

  name: string;
  relativePath: string;
  dotnetVersions: string[];
  dotnetVersion: string;
  test: boolean;
  deploy: boolean;
  deployPort: number;
  project: Project;
  loading: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
              private dotnetService: DotnetService) {

    this.name = data.name;
    this.relativePath = data.relativePath;
    this.dotnetVersion = data.dotnetVersion;
    this.test = data.test;
    this.deploy = data.deploy;
    this.deployPort = data.deployPort;
    
    this.oldRelativePath = this.relativePath;
    this.oldDotnetVersion = this.dotnetVersion;
    this.oldTest = this.test;
    this.oldDeploy = this.deploy;
    this.oldDeployPort = this.deployPort;

    this.project = {
      id: data.projectId,
      name: this.name,
      relativePath: this.relativePath,
      dotnetVersion: this.dotnetVersion,
      test: this.test,
      deploy: this.deploy,
      deployPort: this.deployPort,
      user: data.user,
    };
  }

  ngOnInit(): void {

    this.getDotnetVersions();
  }

  ngDoCheck(): void {
    
    if (this.relativePath != this.oldRelativePath) {

      this.project.relativePath = this.relativePath;
      this.oldRelativePath = this.relativePath;
      return;
    }

    if (this.dotnetVersion != this.oldDotnetVersion) {

      this.project.dotnetVersion = this.dotnetVersion;
      this.oldDotnetVersion = this.dotnetVersion;
      return;
    }

    if (this.test != this.oldTest) {

      this.project.test = this.test;
      this.oldTest = this.test;
      return;
    }

    if (this.deploy != this.oldDeploy) {

      this.project.deploy = this.deploy;
      this.oldDeploy = this.deploy;
      return;
    }

    if (this.deployPort != this.oldDeployPort) {

      this.project.deployPort = this.deployPort;
      this.oldDeployPort = this.deployPort;
      return;
    }
  }

  private getDotnetVersions(): void {

    this.loading = true;

    this.dotnetService.getVersions().subscribe(
      (data) => this.getDotnetVersionsCallback(data, this),
      (error) => this.getDotnetVersionsError(error, this)
    )
  }

  private getDotnetVersionsCallback(dotnetVersions: string[], self: EditProjectComponent): void {
    
    self.loading = false;
    self.dotnetVersions = dotnetVersions;
  }

  private getDotnetVersionsError(httpErrorResponse: HttpErrorResponse, self: EditProjectComponent): void {
    
    self.loading = false;

    console.log(httpErrorResponse);
  }
}
