import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigSettings } from '../../bo/config-settings'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  configSettings: ConfigSettings;

  constructor(private httpClient: HttpClient) { }

  getConfigs(): Observable<ConfigSettings> {

    return this.httpClient.get<ConfigSettings>('./config.json')
                          .pipe(
                            map((configSettings: ConfigSettings) => {

                              return configSettings;
                            })
                          );
  }
}
