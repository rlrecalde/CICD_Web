import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/dto/user';
import { ConfigurationService } from 'src/app/services/api/configuration/configuration.service';
import { UserService } from 'src/app/services/api/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Configuration } from 'src/app/dto/configuration';
import { ConfigurationType } from 'src/app/bo/configuration-type.enum';
import { ProjectService } from 'src/app/services/api/project/project.service';
import { Project } from 'src/app/dto/project';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  private configurations: Configuration[];

  loading: boolean;
  users: User[];
  user: User;
  dotnetVersions: string[];
  projects: Project[];

  constructor(private userService: UserService,
              private projectService: ProjectService,
              private configurationService: ConfigurationService,
              private snackBar: MatSnackBar) {

    this.configurations = [];
    this.loading = false;
    this.users = [];
    this.dotnetVersions = [];
    this.projects = [];
  }

  ngOnInit(): void {

    this.getConfigurations();
    this.getUsers(this);
  }

  childIsLoading(loading: boolean): void {

    this.loading = loading;
  }

  errorReceived(httpErrorResponse: HttpErrorResponse): void {

    this.ShowErrorMessage(httpErrorResponse, this);
  }

  userAdded(): void {

    this.getUsers(this);
  }

  projectAdded(): void {

    this.getProjects();
  }

  projectRemoved(): void {

    this.getProjects();
  }

  userSelected(selectedUser: User): void {

    this.user = selectedUser;
    this.getProjects();
  }

  setDefaultUser(): void {

    const existingConfiguration: Configuration = this.getExistingConfigurationByType(ConfigurationType.DefaultUserId);

    if (existingConfiguration === null) {

      const configuration: Configuration = {

        id: 0,
        configurationTypeId: ConfigurationType.DefaultUserId,
        value: this.user.id.toString(),
      }
  
      this.createConfiguration(configuration);
    } else {

      existingConfiguration.value = this.user.id.toString();
      this.updateConfiguration(existingConfiguration);
    }
  }

  private getConfigurations() {

    this.loading = true;

    this.configurationService.get().subscribe(
      (data) => this.getConfigurationsCallback(data, this),
      (error) => this.getConfigurationsError(error, this)
    );
  }

  private getConfigurationsCallback(configurations: Configuration[], self: MainComponent): void {

    self.loading = false;
    self.configurations = configurations;
  }
  
  private getConfigurationsError(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {

    self.loading = false;
    self.ShowErrorMessage(httpErrorResponse, self);
  }

  private getUsers(self: MainComponent): void {

    self.loading = true;

    self.userService.get().subscribe(
      (data) => self.getUsersCallback(data, self),
      (error) => self.getUsersError(error, self)
    );
  }

  private getUsersCallback(users: User[], self: MainComponent): void {

    self.loading = false;
    self.users = users;
  }

  private getUsersError(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {

    self.loading = false;
    self.ShowErrorMessage(httpErrorResponse, self);
  }

  private getProjects(): void {

    this.loading = true;

    this.projectService.getByUserId(this.user.id).subscribe(
      (data) => this.getProjectsCallback(data, this),
      (error) => this.getProjectsError(error, this)
    );
  }

  private getProjectsCallback(projects: Project[], self: MainComponent): void {
    
    self.loading = false;
    self.projects = projects;
    self.setUserInProjects(self);
  }

  private getProjectsError(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {
    
    self.loading = false;
    self.ShowErrorMessage(httpErrorResponse, self);
  }

  private createConfiguration(configuration: Configuration): void {

    this.loading = true;

    this.configurationService.create(configuration).subscribe(
      (data) => this.createConfigurationCallback(data, this),
      (error) => this.createConfigurationError(error, this)
    );
  }

  private createConfigurationCallback(configuration: Configuration, self: MainComponent): void {

    self.loading = false;
    self.configurations.push(configuration);
    self.getUsers(self);
  }

  private createConfigurationError(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {

    self.loading = false;
    self.ShowErrorMessage(httpErrorResponse, self);
  }

  private updateConfiguration(configuration: Configuration): void {

    this.loading = true;

    this.configurationService.update(configuration).subscribe(
      () => this.updateConfigurationCallback(this),
      (error) => this.updateConfigurationError(error, this)
    );
  }

  private updateConfigurationCallback(self: MainComponent) {

    self.loading = false;
    self.getUsers(self);
  }

  private updateConfigurationError(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {

    self.loading = false;
    self.ShowErrorMessage(httpErrorResponse, self);
  }

  private getExistingConfigurationByType(configurationType: ConfigurationType): Configuration {

    for (let index = 0; index < this.configurations.length; index++) {

      if (this.configurations[index].configurationTypeId == configurationType) {
        
        return this.configurations[index];
      }
    }

    return null;
  }

  private setUserInProjects(self: MainComponent): void {

    for (let index = 0; index < self.projects.length; index++) {
      
      self.projects[index].user = self.user;
    }
  }

  private ShowErrorMessage(httpErrorResponse: HttpErrorResponse, self: MainComponent): void {

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

    self.snackBar.open(errorMessage, 'X');
  }
}
