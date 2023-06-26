import {
	ActivatedRouteSnapshot,
	ResolveFn,
	RouterStateSnapshot,
} from "@angular/router";
import ClipModel from "../models/clip.model";
import { Observable } from "rxjs/internal/Observable";
import { inject } from "@angular/core";
import { ClipService } from "../services/clip.service";

export const clipResolver: ResolveFn<ClipModel | null | undefined> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	clipService: ClipService = inject(ClipService)
):
	| ClipModel
	| Observable<ClipModel | null>
	| Promise<ClipModel | null>
	| null => {
	return clipService.getClip(route.paramMap.get("id"));
};
