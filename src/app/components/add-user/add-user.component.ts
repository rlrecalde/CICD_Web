import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/dto/user';
import { UserService } from 'src/app/services/api/user/user.service';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  @ViewChild(MatExpansionPanel)
  panel: MatExpansionPanel;

  name: string;
  token: string;

  @Input()
  loading: boolean;

  @Output()
  loadingEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  errorEvent: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();

  @Output()
  addedUserEvent: EventEmitter<User> = new EventEmitter<User>();

  constructor(private userService: UserService) {

    this.name = '';
    this.token = '';
  }

  ngOnInit(): void {
  }

  addUser(): void {

    this.loadingEvent.emit(true);

    const user: User = {
      id: 0,
      name: this.name,
      token: this.token,
      isDefault: false,
    }

    this.userService.create(user).subscribe(
      (data) => this.addUserCallback(data, this),
      (error) => this.addUserError(error, this)
    );
  }

  addUserCallback(addedUser: User, self: AddUserComponent): void {

    self.loadingEvent.emit(false);
    self.addedUserEvent.emit(addedUser);

    self.name = '';
    self.token = '';

    self.panel.close();
  }

  addUserError(httpErrorResponse: HttpErrorResponse, self: AddUserComponent): void {

    self.loadingEvent.emit(false);
    self.errorEvent.emit(httpErrorResponse);

    console.log(httpErrorResponse);
  }
}
