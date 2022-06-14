import Nedb from "@seald-io/nedb";
const Datastore = (<any>window).require('@seald-io/nedb');
import { environment } from "../../../environments/environment"
import { DatabaseNames } from "./database_names.entity";

class DatabaseManager {
    /**
     * The connection to the database
     */
    private database: Nedb;

    constructor(db: DatabaseNames) {
        console.log(`Loading database: ${db}, environment: ${environment.appData}`);
        this.database = new Datastore(`${environment.appData[1]}/angular/${db}_test.db`);
        this.database.loadDatabase();
        console.log(`${db} database loaded`);
    }

    insertSingle(object: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.database.insert(object, function (err: Error | null, newDoc: any) {
                if (err !== null) {
                    resolve(null);
                } else {
                    resolve(newDoc);
                }
            });
        });
    }

    findSingle(object: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.database.findOne(object, function (err: Error | null, doc: any) {
                if (err !== null) {
                    resolve(null);
                } else {
                    resolve(doc);
                }
            });
        });
    }

    findMultiple(object: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.database.find(object, function (err: Error | null, docs: any) {
                if (err !== null) {
                    resolve(null);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    getAllDocuments(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.database.find({}, function (err: Error | null, docs: any) {
                if (err !== null) {
                    resolve([]);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    count(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.database.count({}, function (err: Error | null, count: number) {
                if (err !== null) {
                    resolve(0);
                } else {
                    resolve(count);
                }
            });
        });
    }
}

export { DatabaseManager }