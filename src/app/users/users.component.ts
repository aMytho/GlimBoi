import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../core/users/user.entity';
import { UserManager } from '../core/users/user_manager.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    dtOptions: DataTables.Settings = {};
    users: User[] = [];
    dtTrigger: Subject<any> = new Subject<any>();


    constructor(
        private userManager: UserManager
    ) { }

    async ngOnInit() {
        this.dtOptions = {
            columns: [
                {
                    title: "User",
                    data: "userName"
                },
                {
                    title: "Points",
                    data: "points"
                },
                {
                    title: "Watch Time",
                    data: "watchTime"
                },
                {
                    title: "Role",
                    data: "role"
                },
                {
                    title: "Link",
                },
                {
                    title: "Quotes",
                },
                {
                    title: "Delete",
                }
            ],
            columnDefs: [
                {
                    targets: -1,
                    data: null,
                    defaultContent: "<button class='deletionIcon'><i class='fas fa-trash'></i></button>"
                },
                {
                    targets: -2,
                    data: null,
                    defaultContent: "<button class='quoteIcon'>Open</button>"
                }, {
                    targets: -3,
                    data: null,
                    render: function (data, type, row, meta) {
                        if (type === 'display') {
                            data = `<a href="javascript:void(0)" disabled>Glimesh Profile</a>`;
                        }
                        return data;
                    }
                }],
                data: await this.userManager.getAll(),
            pageLength: 25
        }
        $('#userTable').DataTable(this.dtOptions);
    }

}
