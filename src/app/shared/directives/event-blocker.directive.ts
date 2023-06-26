import { Directive, HostListener } from "@angular/core";

@Directive({
	selector: "[ngEventBlocker]",
})
export class EventBlockerDirective {
	@HostListener("drop", ["$event"])
	@HostListener("dragover", ["$event"])
	public handleEvent(e: Event) {
		e.preventDefault();
		e.stopPropagation();
	}
}
