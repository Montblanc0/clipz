import {
	AfterViewInit,
	Component,
	OnInit,
	OnDestroy,
	inject,
	Input,
} from "@angular/core";
import { ClipService } from "../services/clip.service";

@Component({
	selector: "app-clips-list",
	templateUrl: "./clips-list.component.html",
	styleUrls: ["./clips-list.component.sass"],
})
export class ClipsListComponent implements AfterViewInit, OnInit, OnDestroy {
	@Input() isScrollable: boolean = true;
	clipService: ClipService = inject(ClipService);
	observer?: IntersectionObserver;

	private fetchClips = async () => {
		try {
			await this.clipService.getClips();
		} catch (e) {
			console.error((e as Error).message);
			return;
		}
	};

	constructor() {}

	async ngOnInit(): Promise<void> {
		await this.fetchClips();
	}

	ngAfterViewInit(): void {
		if (this.isScrollable) {
			this.observer = new IntersectionObserver(
				entries => {
					const isIntersecting = entries[0]?.isIntersecting ?? false;
					if (isIntersecting) this.fetchClips();
				},
				{ rootMargin: "100px 0px 0px 0px" }
			);
			const intersection = document.querySelector(".intersection");
			if (intersection) this.observer.observe(intersection);
		}
	}

	ngOnDestroy(): void {
		this.clipService.pageClips = [];
		if (this.observer) this.observer.disconnect();
	}
}
