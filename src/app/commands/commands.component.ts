import { Component, OnInit } from '@angular/core';
import { Command } from '../core/commands/command.entity';
import { CommandManager } from '../core/commands/command_manager.service';

@Component({
    selector: 'app-commands',
    templateUrl: './commands.component.html',
    styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {
    public currentPage: number = 1;
    commands: Command[] = [];
    public dataTableOptions: DataTables.Settings = {
        columns: [
            {
                title: "Commands",
                data: "commandName",
            },
            {
                title: "Data",
                data: "message",
            },
            {
                title: "Uses",
                data: "uses",
            },
            {
                title: "Points",
                data: "points",
            },
            {
                title: "Rank",
                data: "rank",
            },
            {
                title: "Status",
            },
            {
                title: "Delete"
            }
        ],
        data: this.commands,
        columnDefs: [
            {
                targets: -1,
                data: null,
                defaultContent: "<button class='btn-danger deletionIcon'><i class='fas fa-trash'></i></button>"
            },
            {
                className: "border-t-teal-50",
                targets: 1,
                data: "message",
                render: function (data, type, row, meta) {
                    if (data == undefined || data == null) {
                        let actionString = ""
                        for (let i = 0; i < row.actions.length; i++) {
                            if (i == 3) {
                                actionString = actionString + "..."
                                break
                            }
                            actionString = actionString.concat(row.actions[i].action, ": ", row.actions[i][`${row.actions[i].info[0].length > 1 && row.actions[i].info[0] || row.actions[i].info}`]);
                            if (row.actions.length - 1 !== i) {
                                actionString = actionString.concat(", ")
                            }
                        }
                        return actionString
                    }
                    return data;
                }
            },
            {
                targets: 5,
                data: null,
                render: function (data, type, row, meta) {
                    if (data.disabled != undefined && data.disabled == true) {
                        data = `
                        <div class="niceSwitch">
                    <label class="switch">
                        <input type="checkbox">
                        <span class="slider round"></span>
                    </label>
                    </div>`
                    } else {
                        data = `
                        <div class="niceSwitch">
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                </div>`
                    }
                    return data;
                }
            }
        ],
    };

    constructor(
        private commandManager: CommandManager
    ) { }

    async ngOnInit() {
        await this.getCommands();
    }

    setPage(page: number) {
        this.currentPage = page;
    }

    getCommands() {
        return new Promise((resolve, reject) => {
            this.commandManager.getAll().then(commands => {
                this.commands = commands;
                console.log(this.commands);
                resolve(true);
            });
        });
    }
}
