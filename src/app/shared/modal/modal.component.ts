import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ElementRef,
	inject,
} from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
	selector: "app-modal",
	templateUrl: "./modal.component.html",
	styleUrls: ["./modal.component.sass"],
})
export class ModalComponent implements OnInit, OnDestroy {
	public modal: ModalService = inject(ModalService);
	private el: ElementRef = inject(ElementRef);
	@Input() modalID = "";

	constructor() {}

	ngOnInit(): void {
		document.body.appendChild(this.el.nativeElement);
	}

	closeModal() {
		this.modal.toggleModal(this.modalID);
	}

	ngOnDestroy(): void {
		document.body.removeChild(this.el.nativeElement);
	}
}
