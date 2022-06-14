export class PointsForm {
    constructor(
        /**
         * The amount of currency all users start with
         */
        public startingPoints: number,
        /**
         * How much currency is awarded every cycle
         */
        public earningPoints: number,
        /**
         * The name of the currency
         */
        public pointsName: string,
    ) {}
}