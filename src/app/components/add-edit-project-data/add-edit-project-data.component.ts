import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-add-edit-project-data',
  templateUrl: './add-edit-project-data.component.html',
  styleUrls: ['./add-edit-project-data.component.css']
})
export class AddEditProjectDataComponent implements OnInit {

  @Input()
  name: string;
  @Output()
  nameChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  relativePath: string;
  @Output()
  relativePathChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  dotnetVersion: string;
  @Output()
  dotnetVersionChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  test: boolean;
  @Output()
  testChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  deploy: boolean;
  @Output()
  deployChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  deployPort: number;
  @Output()
  deployPortChange: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  dotnetVersions: string[];

  @Input()
  editMode: boolean;

  @Input()
  loading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
