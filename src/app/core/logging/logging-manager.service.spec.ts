import { TestBed } from '@angular/core/testing';

import { LoggingManagerService } from './logging-manager.service';

describe('LoggingManagerService', () => {
  let service: LoggingManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
