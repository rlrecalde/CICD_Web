import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Project } from 'src/app/dto/project';

@Injectable({
  providedIn: 'root'
})
export class DotnetService {

  private dotnetEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.dotnetEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                             this.configService.configSettings.dotnetEndpoint;
  }

  getVersions(): Observable<string[]> {

    const url = this.dotnetEndpointUrl + '/' + this.configService.configSettings.versionsRoute;

    return this.httpClient.get<string[]>(url)
                          .pipe(
                            map((versions: string[]) => {

                              return versions;
                            })
                          );
  }

  build(project: Project): Observable<any> {

    const url = this.dotnetEndpointUrl + '/' + this.configService.configSettings.buildRoute;

    return this.httpClient.post(url, project);
  }

  test(project: Project): Observable<any> {

    const url = this.dotnetEndpointUrl + '/' + this.configService.configSettings.testRoute;

    return this.httpClient.post(url, project);
  }
}
