import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import {
	AngularFirestore,
	AngularFirestoreCollection,
} from "@angular/fire/compat/firestore";
import IUser from "../interfaces/user";
import UserModel from "../models/user.model";
import { Observable, of } from "rxjs";
import { map, filter, switchMap } from "rxjs/operators";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
@Injectable({
	providedIn: "root",
})
export class AuthService {
	private usersCollection: AngularFirestoreCollection;
	public isAuthenticated$: Observable<boolean>;
	public redirect: boolean = false;
	constructor(
		private auth: AngularFireAuth,
		private db: AngularFirestore,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.usersCollection = this.db.collection<UserModel>("users");
		// transform user observable into an Observable<boolean> to keep track of authentication
		this.isAuthenticated$ = this.auth.user.pipe(map(user => !!user));
		this.router.events
			.pipe(
				filter(e => e instanceof NavigationEnd),
				// grab the first child in the tree of Activated Routes
				map(_ => this.route.firstChild),
				switchMap(route => route?.data ?? of({ authOnly: false }))
			)
			.subscribe(data => (this.redirect = data.authOnly ?? false));
	}

	public async createUser(userData: IUser): Promise<any> {
		// besides "password" and "confirmPassword", the remaining keys are spread into "user"
		const { password, confirmPassword, ...user } = userData;
		const userCred = await this.auth.createUserWithEmailAndPassword(
			user.email,
			password
		);
		// use the generated id to create a new document with the same uid
		if (!userCred.user) throw new Error("Could not retrieve user data.");
		await this.usersCollection.doc(userCred.user.uid).set(user);

		userCred.user?.updateProfile({
			displayName: user.name,
		});

		return await new Promise<any>((resolve, reject) => {
			if (userCred) resolve(userCred);
			else
				reject(
					new Error(
						"An error occurred while returning user credentials."
					)
				);
		});
	}

	public async logout(e?: Event): Promise<any> {
		e?.preventDefault();
		await this.auth.signOut();
		if (this.redirect) await this.router.navigateByUrl("");
	}
}
