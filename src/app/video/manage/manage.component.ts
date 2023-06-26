import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ClipService } from "src/app/services/clip.service";
import ClipModel from "src/app/models/clip.model";
import { QuerySnapshot } from "@angular/fire/compat/firestore";
import { ModalService } from "src/app/services/modal.service";
import { BehaviorSubject, Subject } from "rxjs";
@Component({
	selector: "app-manage",
	templateUrl: "./manage.component.html",
	styleUrls: ["./manage.component.sass"],
})
export class ManageComponent implements OnInit, OnDestroy {
	videoOrder: string = "1"; // 1 == desc, 2 == asc
	readonly modalID: string = "editClip";
	clips: ClipModel[] = [];
	activeClip: ClipModel | null = null;
	sort$: BehaviorSubject<string>;
	refresh$: Subject<void> = new Subject<void>();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private clipService: ClipService,
		private modal: ModalService
	) {
		this.sort$ = new BehaviorSubject(this.videoOrder);
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params: Params) => {
			this.videoOrder = params?.["sort"] === "2" ? "2" : "1";
			this.sort$.next(this.videoOrder);
		});
		this.clipService
			.getUserClips(this.sort$)
			.subscribe((docs: QuerySnapshot<ClipModel>) => {
				// The observable will always push a full list of docs
				this.clips = [];
				docs.forEach(doc =>
					this.clips.push({
						docID: doc.id,
						...doc.data(),
					})
				);
			});
	}

	sort(e: Event) {
		const { value } = e.target as HTMLSelectElement;
		this.router.navigate([], {
			queryParams: { sort: value },
			relativeTo: this.route,
		});
	}

	async copyToClipboard(e: MouseEvent, id: string | undefined) {
		e.preventDefault();
		if (!id) return;

		const url = `${location.origin}/clip/${id}`;
		await navigator.clipboard.writeText(url);
		alert("Link copied to clipboard.");
	}

	openModal(e: Event, clip: ClipModel) {
		e.preventDefault();
		this.activeClip = clip;
		this.refresh$.next();
		this.modal.toggleModal(this.modalID);
	}

	update(e: ClipModel) {
		this.clips.forEach((clip: ClipModel, index: number) => {
			if (clip.docID == e.docID) {
				this.clips[index].title = e.title;
			}
		});
	}

	async deleteClip(e: Event, clip: ClipModel) {
		e.preventDefault();
		try {
			await this.clipService.deleteClip(clip);
		} catch (err) {
			console.error((err as Error).message);
			return;
		}
		this.clips.forEach((element: ClipModel, index: number) => {
			if (element.docID == clip.docID) this.clips.splice(index, 1);
		});
	}

	ngOnDestroy(): void {
		this.refresh$.next();
		this.refresh$.complete();
	}
}
