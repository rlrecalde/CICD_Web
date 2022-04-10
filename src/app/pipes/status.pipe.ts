import { Pipe, PipeTransform } from '@angular/core';
import { StatusType } from '../bo/status-type.enum';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(value: StatusType, ...args: unknown[]): string {
    
    if (value == StatusType.Stopped) {
      return 'Run';
    } else if (value == StatusType.Stopping) {
      return 'Stopping...';
    } else if (value == StatusType.Running) {
      return 'Stop'
    }

    return '';
  }
}
