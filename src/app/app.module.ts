import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

import { AppInitializerModule } from '../app/modules/app-initializer.module'
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { UsersComponent } from './components/users/users.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ProjectComponent } from './components/project/project.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { StatusPipe } from './pipes/status.pipe';
import { ProjectToProjectWorkFlowPipe } from './pipes/project-to-project-work-flow.pipe';
import { BranchComponent } from './components/branch/branch.component';
import { WorkFlowStepPipe } from './pipes/work-flow-step.pipe';
import { AddProjectComponent } from './components/add-project/add-project.component';
import { EditProjectComponent } from './components/edit-project/edit-project.component';
import { AddEditProjectDataComponent } from './components/add-edit-project-data/add-edit-project-data.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    UsersComponent,
    AddUserComponent,
    ProjectComponent,
    ProjectsComponent,
    StatusPipe,
    ProjectToProjectWorkFlowPipe,
    BranchComponent,
    WorkFlowStepPipe,
    AddProjectComponent,
    EditProjectComponent,
    AddEditProjectDataComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    AppInitializerModule
  ],
  providers: [
    ProjectToProjectWorkFlowPipe,
    WorkFlowStepPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
