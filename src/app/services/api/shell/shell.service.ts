import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { Project } from 'src/app/dto/project';

@Injectable({
  providedIn: 'root'
})
export class ShellService {

  private shellEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.shellEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                            this.configService.configSettings.shellEndpoint;
  }

  dockerize(project: Project): Observable<any> {

    const url = this.shellEndpointUrl + '/' + this.configService.configSettings.dockerizeRoute;

    return this.httpClient.post(url, project);
  }
}
