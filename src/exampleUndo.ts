import {Thespian} from "./Thespian";
import {assertThat} from "mismatched";
import {TMocked} from "./TMocked";

describe("Thespian By Example: Undo/Redo", () => {
    it("Add two commands and undo()", () => {
        const undoRedo = new UndoManager();
        const thespian = new Thespian();
        const edit: TMocked<Command> = thespian.mock<Command>("edit");
        const replace: TMocked<Command> = thespian.mock<Command>("replace");

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