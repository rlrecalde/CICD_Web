import { TestBed } from '@angular/core/testing';

import { DotnetService } from './dotnet.service';

describe('DotnetService', () => {
  let service: DotnetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DotnetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
