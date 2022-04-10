import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Commit } from 'src/app/dto/commit';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  private commitEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.commitEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                             this.configService.configSettings.commitEndpoint;
  }

  getLastCommitByBranchId(branchId: number): Observable<Commit> {

    const url: string = this.commitEndpointUrl + '/' + branchId.toString();

    return this.httpClient.get<Commit>(url)
                          .pipe(
                            map((commit: Commit) => {

                              return commit;
                            })
                          );
  }

  create(commit: Commit): Observable<any> {

    return this.httpClient.post(this.commitEndpointUrl, commit);
  }
}
