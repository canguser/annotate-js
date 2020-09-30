import {Annotate, DefaultParam} from "../decorator-generator/Annotate";
import {Section} from "./Section";

@Annotate({extends: Section})
export class Surround {
    independent = true;

    @DefaultParam
    before() {
    };

}