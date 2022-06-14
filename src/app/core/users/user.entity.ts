/**
 * A user
 */
export class User {
    /**
     * The user's name
     */
    userName: string;
    /**
     * How much currency the user has
     */
    points: number;
    /**
     * How many minutes the user has watched the steam for
     */
    watchTime: number;
    /**
     * Which team the user is on (unimplemented)
     */
    team: null;
    /**
     * The user's rank
     */
    role: string;
    /**
     * The user's inventory (unimplemented)
     */
    inventory: any[];
    /**
     * The URL to the user's avatar
     */
    picture: string;
    /**
     * Array containg the users quotes
     */
    quotes: any[];
    /**
     * The user's Glimesh user ID
     */
    id: number;

    constructor(userName: string, ID: number) {
        this.userName = userName;
        this.points = Number(0);
        this.watchTime = 0;
        this.team = null;
        this.role = "user";
        this.inventory = [];
        this.picture = "link";
        this.quotes = []
        this.id = ID
    }
}