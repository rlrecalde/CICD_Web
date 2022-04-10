import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Project } from 'src/app/dto/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private projectEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.projectEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                              this.configService.configSettings.projectEndpoint;
  }

  getByUserId(userId: number): Observable<Project[]> {

    const url = this.projectEndpointUrl + '/' + userId.toString();

    return this.httpClient.get<Project[]>(url)
                          .pipe(
                            map((projects: Project[]) => {

                              return projects;
                            })
                          );
  }

  create(project: Project): Observable<Project> {

    return this.httpClient.post<Project>(this.projectEndpointUrl, project)
                          .pipe(
                            map((project: Project) => {

                              return project;
                            })
                          );
  }

  update(project: Project): Observable<any> {

    return this.httpClient.put(this.projectEndpointUrl, project);
  }

  delete(projectId: number): Observable<any> {

    const url = this.projectEndpointUrl + '/' + projectId.toString();

    return this.httpClient.delete(url);
  }
}
