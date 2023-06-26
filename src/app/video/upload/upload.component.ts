import {
	Component,
	OnDestroy,
	WritableSignal,
	inject,
	signal,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
	AngularFireStorage,
	AngularFireUploadTask,
} from "@angular/fire/compat/storage";
import { v4 as uuid } from "uuid";
import firebase from "firebase/compat/app";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import UserModel from "src/app/models/user.model";
import { combineLatest, firstValueFrom, forkJoin, switchMap } from "rxjs";
import ClipModel from "src/app/models/clip.model";
import { ClipService } from "src/app/services/clip.service";
import { FfmpegService } from "src/app/services/ffmpeg.service";
@Component({
	selector: "app-upload",
	templateUrl: "./upload.component.html",
	styleUrls: ["./upload.component.sass"],
})
export default class UploadComponent implements OnDestroy {
	isDragOver: boolean = false;
	file!: File | null;
	isFormVisible: boolean = false;
	title: FormControl = new FormControl("", {
		nonNullable: true,
		validators: [Validators.required, Validators.minLength(3)],
	});
	uploadForm: FormGroup = new FormGroup([this.title]);
	isAlertVisible: boolean = false;
	alertColor: string = "blue";
	alertMsg: string = "Please wait! Your clip is being uploaded...";
	inSubmission: WritableSignal<boolean> = signal(false);
	private task: AngularFireUploadTask | null = null;
	private screenshotTask: AngularFireUploadTask | null = null;
	percentage: number = 0;
	showProgress: boolean = false;
	private db: AngularFirestore = inject(AngularFirestore);
	private storage: AngularFireStorage = inject(AngularFireStorage);
	private afAuth: AngularFireAuth = inject(AngularFireAuth);
	private clipService: ClipService = inject(ClipService);
	private router: Router = inject(Router);
	ffmpegService: FfmpegService = inject(FfmpegService);
	screenshots: string[] | undefined = [];
	selectedScreenshot: string = "";
	constructor() {
		this.ffmpegService.init();
	}

	ngOnDestroy(): void {
		this.task?.cancel();
	}

	async storeFile(e: Event): Promise<void> {
		this.isDragOver = false;

		if (this.ffmpegService.isRunning) return;

		this.file = (e as DragEvent).dataTransfer
			? (e as DragEvent).dataTransfer?.files.item(0) ?? null
			: (e.target as HTMLInputElement).files?.item(0) ?? null;
		const allowedFileTypes: string[] = [
			"video/mp4",
			"video/webm",
			"video/x-matroska",
		];
		if (
			!this.file ||
			!allowedFileTypes.includes(this.file.type) ||
			+this.file.size > 10485760
		)
			return;
		try {
			this.screenshots = await this.ffmpegService.getScreenshots(
				this.file
			);
		} catch (e) {
			console.error((e as Error).message);
			return;
		}
		this.selectedScreenshot = this.screenshots[0];
		this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ""));
		this.isFormVisible = true;
	}

	async uploadFile(): Promise<void> {
		this.isAlertVisible = true;
		this.alertColor = "blue";
		this.alertMsg = "Please wait! Your clip is being uploaded...";
		this.inSubmission.set(true);
		try {
			// Check if user is logged in
			const user = await this.afAuth.currentUser;

			if (!user) {
				this.handleError("User is not logged in.");
				return;
			}

			// Check for user document integrity
			const userRef = this.db.collection("users").doc(user.uid);
			const userSnapshot = await firstValueFrom(userRef.get());
			if (!userSnapshot.exists) {
				this.handleError(
					"User has no matching document, try signing up again."
				);
				return;
			}

			// Check for user file count
			const currentFileCount =
				(userSnapshot.data() as UserModel)?.fileCount ?? 0;

			if (currentFileCount >= 5) {
				this.handleError("User has reached video upload limit.");
				return;
			}

			// Create clip data
			const clipFileName: string =
				uuid() +
				this.file?.name.substring(this.file?.name.lastIndexOf("."));
			const clipPath = `clips/${clipFileName}`;
			const type = this.file?.type;

			// Create screenshot data
			const screenshotBlob = await this.ffmpegService.getBlobFromUrl(
				this.selectedScreenshot
			);

			const screenshotPath = `screenshots/${clipFileName}.png`;

			// Upload clip to storage
			this.task = this.storage.upload(clipPath, this.file);
			const clipRef = this.storage.ref(clipPath);

			// Upload screenshot to storage
			this.screenshotTask = this.storage.upload(
				screenshotPath,
				screenshotBlob
			);
			const screenshotRef = this.storage.ref(screenshotPath);

			// Track upload progress
			this.showProgress = true;
			combineLatest([
				this.task.percentageChanges(),
				this.screenshotTask.percentageChanges(),
			]).subscribe(progress => {
				const [clipProgress, screenshotProgress] = progress;
				if (!clipProgress || !screenshotProgress) return;
				const total = clipProgress + screenshotProgress;
				this.percentage = (total as number) / 200;
			});

			// Track snapshot changes
			forkJoin([
				this.task.snapshotChanges(),
				this.screenshotTask.snapshotChanges(),
			])
				.pipe(
					switchMap(() =>
						forkJoin([
							clipRef.getDownloadURL(),
							screenshotRef.getDownloadURL(),
						])
					)
				)
				.subscribe({
					next: async urls => {
						const [clipURL, screenshotURL] = urls;
						// Create clip data
						const clip: ClipModel = {
							uid: user.uid,
							author: user.displayName as string,
							title: this.title.value,
							fileName: clipFileName,
							url: clipURL,
							screenshot: screenshotURL,
							screenshotFileName: `${clipFileName}.png`,
							timestamp:
								firebase.firestore.FieldValue.serverTimestamp(),
							type: type as string,
						};

						// Upload clip document
						const clipRef = await this.clipService.createClip(clip);

						// Update user file count
						await userRef.update({
							fileCount: currentFileCount + 1,
						});

						// Display success
						this.alertColor = "green";
						this.alertMsg =
							"Success! Your clip is ready to be shared. Redirecting...";
						this.showProgress = false;

						// Redirect to clip view
						setTimeout(
							() => this.router.navigate(["clip", clipRef.id]),
							2000
						);
					},
					error: err => {
						this.handleError(err);
						return;
					},
				});
		} catch (e) {
			this.handleError(e);
			return;
		}
	}

	handleError(e?: any) {
		this.alertColor = "red";
		this.alertMsg = e instanceof Error ? e.message : e;
		this.showProgress = false;
		this.isAlertVisible = true;
		this.inSubmission.set(false);
	}
}
