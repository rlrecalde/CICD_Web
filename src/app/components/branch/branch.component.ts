import { Component, Input, OnInit } from '@angular/core';
import { BranchStep } from 'src/app/bo/branch-step';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {

  @Input()
  branchStep: BranchStep;

  constructor() { }

  ngOnInit(): void {
  }
}
