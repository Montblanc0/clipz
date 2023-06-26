import { Component, inject } from "@angular/core";
import { FirebaseError } from "@angular/fire/app";
import { AngularFireAuth } from "@angular/fire/compat/auth";

interface ILogin {
	email: string;
	password: string;
}

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.sass"],
})
export class LoginComponent {
	private auth: AngularFireAuth = inject(AngularFireAuth);
	credentials: ILogin = {
		email: "",
		password: "",
	};
	isAlertVisible: boolean = false;
	alertColor: string = "blue";
	alertMsg: string = "Logging in... please wait.";
	inSubmission: boolean = false;

	constructor() {}

	async login() {
		this.isAlertVisible = true;
		this.inSubmission = true;
		try {
			await this.auth.signInWithEmailAndPassword(
				this.credentials.email,
				this.credentials.password
			);
			this.alertColor = "green";
			this.alertMsg = "Successfully signed in!";
		} catch (e) {
			this.inSubmission = false;
			this.alertColor = "red";
			this.alertMsg = (e as FirebaseError).message;
		}
	}
}
