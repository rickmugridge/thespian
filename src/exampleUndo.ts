import {Thespian} from "./Thespian";
import {assertThat} from "mismatched";
import {TMocked} from "./TMocked";

describe("Thespian By Example: Undo/Redo", () => {
    let thespian: Thespian;
    let edit: TMocked<Command>;
    let replace: TMocked<Command>;
    let undoRedo: UndoManager;

    beforeEach(()=>{
        thespian = new Thespian();
        edit = thespian.mock("edit");
        replace= thespian.mock("replace");
        undoRedo = new UndoManager();
    })

    afterEach(()=> thespian.verify());

    it("Add two commands and undo()", () => {
        // Given
        replace
            .setup(f => f.undo())
            .returnsVoid();
        edit
            .setup(f => f.details())
            .returns(() => "Edit");
        undoRedo.add(edit.object);
        undoRedo.add(replace.object);

        // When
        undoRedo.undo();

        // Then
        assertThat(undoRedo.currentDetails()).is("Edit");
        thespian.verify();
    });
});

interface Command {
    details(): string;

    undo(): void;

    redo(): void;
}

class UndoManager {
    readyToUndo: Array<Command> = [];
    readyToRedo: Array<Command> = [];

    add(command: Command) {
        this.readyToUndo.push(command);
    }

    undo() {
        if (this.readyToUndo.length > 0) {
            const command = this.readyToUndo.pop()!;
            this.readyToRedo.push(command);
            command.undo();
        }
    }

    currentDetails(): string {
        if (this.readyToUndo.length > 0) {
            return this.readyToUndo[0].details();
        }
        return "None";
    }
}