import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { Configuration } from 'src/app/dto/configuration';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private configurationEndpointUrl: string;

  constructor(private configService: ConfigService, private httpClient: HttpClient) {

    this.configurationEndpointUrl = this.configService.configSettings.baseAPIUrl + '/' +
                                    this.configService.configSettings.configurationEndpoint;
  }

  get(): Observable<Configuration[]> {

    return this.httpClient.get<Configuration[]>(this.configurationEndpointUrl)
                          .pipe(
                            map((configurations: Configuration[]) => {

                              return configurations;
                            })
                          );
  }

  create(configuration: Configuration): Observable<Configuration> {

    return this.httpClient.post<Configuration>(this.configurationEndpointUrl, configuration)
                          .pipe(
                            map((configuration: Configuration) => {

                              return configuration;
                            })
                          );
  }

  update(configuration: Configuration): Observable<any> {

    return this.httpClient.put(this.configurationEndpointUrl, configuration);
  }
}
