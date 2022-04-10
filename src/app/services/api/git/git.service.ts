import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Project } from 'src/app/dto/project';
import { Branch } from 'src/app/dto/branch';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  private gitEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.gitEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                          this.configService.configSettings.gitEndpoint;
  }

  getHeadBranch(project: Project): Observable<Branch> {

    const url = this.gitEndpointUrl + '/' + this.configService.configSettings.headBranchRoute;

    return this.httpClient.post<Branch>(url, project)
                          .pipe(
                            map((branch: Branch) => {

                              return branch;
                            })
                          );
  }

  clone(project: Project): Observable<any> {

    const url = this.gitEndpointUrl + '/' + this.configService.configSettings.cloneRoute;

    return this.httpClient.post(url, project);
  }

  fetch(project: Project): Observable<any> {

    const url = this.gitEndpointUrl + '/' + this.configService.configSettings.fetchRoute;

    return this.httpClient.post(url, project);
  }

  switch(branch: Branch): Observable<any> {

    const url = this.gitEndpointUrl + '/' + this.configService.configSettings.switchRoute;

    return this.httpClient.post(url, branch);
  }

  pull(project: Project): Observable<any> {

    const url = this.gitEndpointUrl + '/' + this.configService.configSettings.pullRoute;

    return this.httpClient.post(url, project);
  }
}
