import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Branch } from 'src/app/dto/branch';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private branchEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.branchEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                             this.configService.configSettings.branchEndpoint;
  }

  getByProjectId(projectId: number): Observable<Branch[]> {

    const url: string = this.branchEndpointUrl + '/' + projectId.toString();

    return this.httpClient.get<Branch[]>(url)
                          .pipe(
                            map((branches: Branch[]) => {

                              return branches;
                            })
                          );
  }

  create(branch: Branch): Observable<Branch> {

    return this.httpClient.post<Branch>(this.branchEndpointUrl, branch)
                          .pipe(
                            map((branch: Branch) => {

                              return branch;
                            })
                          );
  }

  createMany(branches: Branch[]): Observable<Branch[]> {

    const url: string = this.branchEndpointUrl + '/' + this.configService.configSettings.manyRoute;

    return this.httpClient.post<Branch[]>(url, branches)
                          .pipe(
                            map((branches: Branch[]) => {

                              return branches;
                            })
                          );
  }

  markAsDeleted(branch: Branch): Observable<any> {

    return this.httpClient.put(this.branchEndpointUrl, branch);
  }

  markManyAsDeleted(branches: Branch[]): Observable<any> {

    const url: string = this.branchEndpointUrl + '/' + this.configService.configSettings.manyRoute;

    return this.httpClient.put(url, branches);
  }
}
