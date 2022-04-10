import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Project } from 'src/app/dto/project';
import { Branch } from 'src/app/dto/branch';
import { Commit } from 'src/app/dto/commit';
import { Comment } from 'src/app/dto/comment';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {

  private gitHubEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.gitHubEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                             this.configService.configSettings.gitHubEndpoint;
  }

  getBranches(project: Project): Observable<Branch[]> {

    const url = this.gitHubEndpointUrl + '/' + this.configService.configSettings.branchesRoute;

    return this.httpClient.post<Branch[]>(url, project)
                          .pipe(
                            map((branches: Branch[]) => {

                              return branches;
                            })
                          );
  }

  getlastCommit(branch: Branch): Observable<Commit> {

    const url = this.gitHubEndpointUrl + '/' + this.configService.configSettings.lastCommitRoute;

    return this.httpClient.post<Commit>(url, branch)
                          .pipe(
                            map((commit: Commit) => {

                              return commit;
                            })
                          );
  }

  sendComment(comment: Comment): Observable<any> {

    const url = this.gitHubEndpointUrl + '/' + this.configService.configSettings.commentRoute;

    return this.httpClient.post(url, comment);
  }
}
