import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { User } from 'src/app/dto/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.userEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                           this.configService.configSettings.userEndpoint;
  }

  get(): Observable<User[]> {

    return this.httpClient.get<User[]>(this.userEndpointUrl)
                          .pipe(
                            map((users: User[]) => {

                              return users;
                            })
                          );
  }

  create(user: User): Observable<User> {

    return this.httpClient.post<User>(this.userEndpointUrl, user)
                          .pipe(
                            map((user: User) => {

                              return user;
                            })
                          );
  }

  update(user: User): Observable<any> {

    return this.httpClient.put(this.userEndpointUrl, user);
  }

  delete(userId: number): Observable<any> {

    const url = this.userEndpointUrl + '/' + userId.toString();

    return this.httpClient.delete(url);
  }
}
