import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config/config.service'
import { ConfigSettings } from '../bo/config-settings'
import { HttpErrorResponse } from '@angular/common/http';

function load(configService: ConfigService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      
      configService.getConfigs().subscribe(
        (configSettings: ConfigSettings) => {

          configService.configSettings = configSettings;
          resolve(true);
        },
        (httpErrorResponse: HttpErrorResponse) => {

          console.log(httpErrorResponse);
          resolve(true);
        }
      );
    });
  };
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: load,
    deps: [
      ConfigService
    ],
    multi: true
  }]
})
export class AppInitializerModule { }
