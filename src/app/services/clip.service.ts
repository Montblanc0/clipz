import { Injectable, inject } from "@angular/core";
import {
	AngularFirestore,
	AngularFirestoreCollection,
	AngularFirestoreDocument,
	QuerySnapshot,
} from "@angular/fire/compat/firestore";
import ClipModel from "../models/clip.model";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { map, switchMap } from "rxjs/operators";
import {
	BehaviorSubject,
	Observable,
	firstValueFrom,
	of,
	combineLatest,
} from "rxjs";
import firebase from "firebase/compat/app";
import FieldValue = firebase.firestore.FieldValue;
import { Router } from "@angular/router";

@Injectable({
	providedIn: "root",
})
export class ClipService {
	public clipsCollection: AngularFirestoreCollection<ClipModel>;
	public pageClips: ClipModel[] = [];
	private pendingReq: boolean = false;
	private db: AngularFirestore = inject(AngularFirestore);
	private afAuth: AngularFireAuth = inject(AngularFireAuth);
	private storage: AngularFireStorage = inject(AngularFireStorage);
	private router: Router = inject(Router);
	constructor() {
		this.clipsCollection = this.db.collection("clips");
	}

	getClip(id: string | null) {
		if (!id) {
			this.router.navigate(["/", "error"]);
			return null;
		}
		return this.clipsCollection
			.doc(id)
			.get()
			.pipe(
				map(snapshot => {
					const data = snapshot.data();
					if (!data) {
						this.router.navigate(["/", "error"]);
						return null;
					}
					return data;
				})
			);
	}

	createClip(data: ClipModel) {
		return this.clipsCollection.add(data);
	}

	getUserClips(sort$: BehaviorSubject<string>): Observable<any> {
		return combineLatest([this.afAuth.user, sort$]).pipe(
			switchMap(values => {
				const [user, sort] = values;
				if (!user) return of([]);
				const query = this.clipsCollection.ref
					.where("uid", "==", user.uid as string)
					.orderBy("timestamp", sort === "1" ? "desc" : "asc");
				return query.get();
			}),
			map(snapshot => {
				if (Array.isArray(snapshot) && snapshot.length === 0)
					// assume user is not logged in
					return snapshot;
				else return (snapshot as QuerySnapshot<ClipModel>).docs;
			})
		);
	}

	async updateClip(id: string, title: string): Promise<void> {
		const user = await firstValueFrom(this.afAuth.user);
		const clipDoc = this.clipsCollection.doc(id);
		await this.checkUserRightsForClip(user, clipDoc);

		await clipDoc.update({ title });
	}

	async deleteClip(clip: ClipModel): Promise<void> {
		//Check user rights
		const user = await firstValueFrom(this.afAuth.user);
		const clipDoc = this.clipsCollection.doc(clip.docID);
		await this.checkUserRightsForClip(user, clipDoc);

		// Delete clip and screenshot from storage
		const clipRef = this.storage.ref(`clips/${clip.fileName}`);
		const screenshotRef = this.storage.ref(
			`screenshots/${clip.screenshotFileName}`
		);
		await firstValueFrom(clipRef.delete());
		await firstValueFrom(screenshotRef.delete());

		// Delete data from database
		await clipDoc.delete();

		// Decrement user's file count
		this.db
			.collection("users")
			.doc(user?.uid)
			.update({ fileCount: FieldValue.increment(-1) });
	}

	async checkUserRightsForClip(
		user: firebase.User | null,
		clipDoc: AngularFirestoreDocument<ClipModel>
	): Promise<boolean> {
		if (!user) {
			throw new Error("User not authenticated");
		}
		const ref = await clipDoc.ref.get();
		if (user.uid !== ref.get("uid")) {
			throw new Error("User unauthorized");
		}
		return true;
	}

	async getClips() {
		if (this.pendingReq) return;
		this.pendingReq = true;

		try {
			let query = this.clipsCollection.ref
				.orderBy("timestamp", "desc")
				.limit(6);
			const { length } = this.pageClips;
			if (length) {
				const lastDocID = this.pageClips.at(-1)?.docID;
				const lastDoc = await firstValueFrom(
					this.clipsCollection.doc(lastDocID).get()
				);
				query = query.startAfter(lastDoc);
			}
			const snapshot = await query.get();
			snapshot.forEach(doc => {
				this.pageClips.push({
					docID: doc.id,
					...doc.data(),
				});
			});
		} catch (e) {
			throw e;
		} finally {
			this.pendingReq = false;
		}
	}
}
