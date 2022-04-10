import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectDataComponent } from './add-edit-project-data.component';

describe('AddEditProjectDataComponent', () => {
  let component: AddEditProjectDataComponent;
  let fixture: ComponentFixture<AddEditProjectDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProjectDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProjectDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
