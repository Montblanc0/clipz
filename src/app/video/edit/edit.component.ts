import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	OnChanges,
	SimpleChanges,
	signal,
	Output,
	EventEmitter,
	WritableSignal,
	inject,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import ClipModel from "src/app/models/clip.model";
import { ClipService } from "src/app/services/clip.service";
import { ModalService } from "src/app/services/modal.service";

@Component({
	selector: "app-edit",
	templateUrl: "./edit.component.html",
	styleUrls: ["./edit.component.sass"],
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {
	readonly id: string = "editClip";
	@Input() activeClip: ClipModel | null = null;
	@Output() update: EventEmitter<ClipModel> = new EventEmitter();

	clipID: FormControl<string> = new FormControl(
		this.activeClip?.docID ?? "",
		{
			nonNullable: true,
		}
	);
	title: FormControl<string> = new FormControl(this.activeClip?.title ?? "", {
		nonNullable: true,
		validators: [Validators.required, Validators.minLength(3)],
	});
	editForm: FormGroup = new FormGroup([this.title]);
	inSubmission: WritableSignal<boolean> = signal(false);
	isAlertVisible: boolean = false;
	alertColor: string = "blue";
	alertMsg: string = "Update in progress... please wait.";
	private clipService: ClipService = inject(ClipService);
	private modal: ModalService = inject(ModalService);
	@Input() refresh$!: Subject<void>;

	constructor() {}

	ngOnInit(): void {
		this.modal.register(this.id);
		this.refresh$.subscribe(() => {
			this.isAlertVisible = false;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["activeClip"] && changes["activeClip"].currentValue) {
			const { title, docID } = changes["activeClip"].currentValue;
			this.title.setValue(title);
			this.clipID.setValue(docID);
			this.inSubmission.set(false);
			this.isAlertVisible = false;
			return;
		}
	}

	async submit() {
		if (!this.activeClip) return;

		this.inSubmission.set(true);
		this.alertMsg = "Update in progress... please wait.";
		this.alertColor = "blue";
		this.isAlertVisible = true;
		try {
			await this.clipService.updateClip(
				this.clipID.value,
				this.title.value
			);
		} catch (e) {
			this.inSubmission.set(false);
			this.alertColor = "red";
			this.alertMsg =
				(e as Error).message ??
				"Something went wrong. Please, try again";
			return;
		}
		this.activeClip.title = this.title.value;
		this.update.emit(this.activeClip);
		this.inSubmission.set(false);
		this.alertColor = "green";
		this.alertMsg = "Clip updated successfully!";
	}

	ngOnDestroy(): void {
		this.modal.unregister(this.id);
	}
}
