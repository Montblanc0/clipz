import {
	Component,
	ElementRef,
	OnInit,
	ViewChild,
	ViewEncapsulation,
	inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import videojs from "video.js";
import ClipModel from "../models/clip.model";

@Component({
	selector: "app-clip",
	templateUrl: "./clip.component.html",
	styleUrls: ["./clip.component.sass"],
	encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit {
	@ViewChild("videoPlayer", { static: true }) target?: ElementRef;
	player?: videojs.Player;
	clip?: ClipModel;
	protected route: ActivatedRoute = inject(ActivatedRoute);

	constructor() {}

	ngOnInit(): void {
		this.player = videojs(this.target?.nativeElement);
		this.route.data.subscribe(data => {
			this.clip = data["clip"];
			this.player?.src({
				src: this.clip?.url as unknown as string,
				type: this.clip?.type as string,
			});
		});
	}
}
