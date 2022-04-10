import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from 'src/app/dto/project';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  @Input()
  projects: Project[];

  @Input()
  loading: boolean;

  @Output()
  removedProjectEvent: EventEmitter<Project> = new EventEmitter<Project>();

  @Output()
  loadingEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  errorEvent: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();

  constructor() { }

  ngOnInit(): void {
  }

  removedProjectEventReceived(project: Project): void {

    this.removedProjectEvent.emit(project);
  }

  loadingEventReceived(event: boolean): void {

    this.loadingEvent.emit(event);
  }

  errorEventReceived(event: HttpErrorResponse): void {

    this.errorEvent.emit(event);
  }
}
