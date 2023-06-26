import { Component, inject } from "@angular/core";
import { ModalService } from "../services/modal.service";
import { AuthService } from "../services/auth.service";

@Component({
	selector: "app-nav",
	templateUrl: "./nav.component.html",
	styleUrls: ["./nav.component.sass"],
})
export class NavComponent {
	private modal: ModalService = inject(ModalService);
	protected auth: AuthService = inject(AuthService);
	readonly modalID = "auth";

	constructor() {}

	openModal(e: Event): void {
		e.preventDefault();
		this.modal.toggleModal(this.modalID);
	}
}
