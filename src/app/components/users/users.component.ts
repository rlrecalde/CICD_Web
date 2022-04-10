import { Component, Input, OnInit, Output, EventEmitter, DoCheck, IterableDiffer, IterableDiffers, IterableChanges } from '@angular/core';
import { User } from 'src/app/dto/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, DoCheck {

  private diffUsers: IterableDiffer<User>;

  selectedUser: User;

  @Input()
  users: User[];

  @Input()
  loading: boolean;

  @Output()
  selectedUserEvent: EventEmitter<User> = new EventEmitter<User>();

  constructor(private iterableDiffers: IterableDiffers) {

  }

  ngOnInit(): void {

    this.diffUsers = this.iterableDiffers.find(this.users).create();

    this.setDefault();
  }

  ngDoCheck(): void {
    
    const changes: IterableChanges<User> = this.diffUsers.diff(this.users);

    if (changes) {

      this.setDefault();
    }
  }

  selectUser(): void {

    this.selectedUserEvent.emit(this.selectedUser);
  }

  private setDefault(): void {

    for (let index = 0; index < this.users.length; index++) {
      if (this.users[index].isDefault == true) {
        this.selectedUser = this.users[index]
        this.selectedUserEvent.emit(this.selectedUser);
      }
    }
  }
}
