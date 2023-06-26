import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
	selector: "app-input",
	templateUrl: "./input.component.html",
	styleUrls: ["./input.component.sass"],
})
export class InputComponent {
	@Input() control: FormControl = new FormControl();
	@Input() type: string = "text";
	@Input() placeholder: string = "";
	@Input() format: string = "";
}
