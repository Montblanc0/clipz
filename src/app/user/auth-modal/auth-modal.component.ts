import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
	selector: "app-auth-modal",
	templateUrl: "./auth-modal.component.html",
	styleUrls: ["./auth-modal.component.sass"],
})
export class AuthModalComponent implements OnInit, OnDestroy {
	readonly id: string = "auth";
	public modal: ModalService = inject(ModalService);

	constructor() {}

	ngOnInit(): void {
		this.modal.register(this.id);
	}

	ngOnDestroy(): void {
		this.modal.unregister(this.id);
	}
}
