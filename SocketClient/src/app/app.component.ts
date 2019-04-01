import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SailsClient } from "ngx-sails";

const httpOptions = {
  headers: new HttpHeaders(
    { 'Content-Type': 'application/json' },
  )
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  users: any;
  currentUser: any;
  isEdit : boolean = false;
  cmsUrl: string;
  currentUserName: string;

  constructor (private http: HttpClient, private sails: SailsClient) {

    this.cmsUrl = 'http://localhost:1337/'
  }

  ngOnInit() {

    this.http.get(this.cmsUrl + 'user/get').subscribe((res: any) => {

      if (res.status === 'SUCCESS') {

        this.users = res.data;
      }
    });

    /**
     * Subscribe to User model with socket server
     */
    this.sails.get(this.cmsUrl + 'user/subscribe').subscribe(res => {

      console.log(JSON.stringify(res, null, 2));
    });

    /**
     * On real time model events of User model
     */
    this.sails.on('user').subscribe((res:any) => {

      console.log(JSON.stringify(res, null, 2));

      /**
       * If new record is created to User model
       */
      if (res.verb === 'created') {

        let user = res.data;
        this.users.push(user);
      }

      /**
       * If update a record in User model
       */
      if (res.verb === 'updated') {

        let user = this.users.filter( user => user.id === res.data.id );
        let index = this.users.indexOf(user[0]);
        if (index > -1) {

          this.users[index].name = res.data.name;
        }
      }

      /**
       * If a record delete in User model
       */
      if (res.verb === 'destroyed') {

        let user = this.users.filter( user => user.id === res.id );
        let index = this.users.indexOf(user[0]);
        if (index > -1) {

          this.users.splice(index, 1);
        }
      }
    });
  }

  /**
   * On Edit button clicked
   * 
   * @param user :: currentUser
   */
  onEditClick(user) {

    this.isEdit = true;
    this.currentUser = user;
    this.currentUserName = this.currentUser.name;
  }

  /**
   * On Add User button clicked
   */
  onAddClick() {

    this.isEdit = false;
    this.currentUser = null;
    this.currentUserName = null;
  }

  onModalClose() {

    if (this.isEdit) {

      this.editUser();
    }

    if (!this.isEdit) {

      this.addUser();
    }

  }

  /**
   * Create a user
   */
  addUser() {

    this.http.post(this.cmsUrl + 'user/create', { name: this.currentUserName }, httpOptions)
    .subscribe( res => {

      console.log(JSON.stringify(res, null, 2));
    });
  }

  /**
   * Update user
   */
  editUser() {

    this.http.put(this.cmsUrl + 'user/update', { id: this.currentUser.id, name: this.currentUserName }, httpOptions)
    .subscribe( res => {

      console.log(JSON.stringify(res, null, 2));
    });
  }

  /**
   * Delete user
   * 
   * @param user :: currentUser
   */
  deleteUser(user) {

    let params = new HttpParams().set('id', user.id);
    this.http.delete(this.cmsUrl + 'user/delete', { params: params })
      .subscribe( res => {

        console.log(JSON.stringify(res, null, 2));
      });
  }
}
