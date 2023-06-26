import { Component, Input } from "@angular/core";

@Component({
	selector: "app-alert",
	templateUrl: "./alert.component.html",
	styleUrls: ["./alert.component.sass"],
})
export class AlertComponent {
	@Input()
	_color: string = "blue";

	get color(): string {
		return `bg-${this._color}-400`;
	}
}
