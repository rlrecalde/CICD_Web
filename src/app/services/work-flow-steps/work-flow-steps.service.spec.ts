import { TestBed } from '@angular/core/testing';

import { WorkFlowStepsService } from './work-flow-steps.service';

describe('WorkFlowStepsService', () => {
  let service: WorkFlowStepsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkFlowStepsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
