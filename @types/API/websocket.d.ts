declare namespace ClientAPIs {
    export namespace WebsSockets {
        export namespace OBS {
            type OBSType = "input" | "filter" | "transition" | "scene" | "unknown"
            export interface SceneItem {
                cy: number;
                cx: number;
                /**
                 * The point on the source that the item is manipulated from. The sum of 1=Left or 2=Right, and 4=Top or 8=Bottom, or omit to center on that axis.
                 */
                allignment: number;
                /**
                 * The name of this scene item.
                 */
                name: string;
                /**
                 * Scene item ID
                 */
                id: number;
                /**
                 * Whether or not this Scene Item is set to "visible".
                 */
                render: boolean;
                /**
                 * Whether or not the Scene Item is muted.
                 */
                muted: boolean;
                /**
                 * Is the item muted?
                 */
                locked: boolean;
                source_cx: number;
                source_cy: number;
                /**
                 * Source Type
                 */
                type: OBSType;
                volume: number;
                x: number;
                y: number;
                parentGroupName: string;
                groupChildren: SceneItem[];
            }

            export interface Scene {
                /**
                 * Name of the active scene
                 */
                name: string;
                /**
                 * Ordered list of the current scene's source items.
                 */
                sources: SceneItem[];
            }
        }
    }
}