import { Component, inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { FirebaseError } from "@angular/fire/app";
import { AuthService } from "src/app/services/auth.service";
import IUser from "src/app/interfaces/user";
import { RegisterValidators } from "../validators/register-validators";
import { EmailTaken } from "../validators/email-taken";

//Making all properties in an object required
type Complete<T> = {
	[P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
		? T[P]
		: T[P] | undefined;
};
type FilledForm = Complete<FormGroup>;

@Component({
	selector: "app-register",
	templateUrl: "./register.component.html",
	styleUrls: ["./register.component.sass"],
})
export class RegisterComponent {
	private auth: AuthService = inject(AuthService);
	private emailTaken: EmailTaken = inject(EmailTaken);
	isAlertVisible: boolean = false;
	alertMsg: string = "";
	alertColor: string = "blue";
	inSubmission: boolean = false;

	name: FormControl = new FormControl("", [
		Validators.required,
		Validators.minLength(3),
	]);
	email: FormControl = new FormControl("", {
		asyncValidators: this.emailTaken.validate,
		updateOn: "blur",
		validators: [
			Validators.required,
			Validators.pattern(
				/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
			),
		],
	});
	age: FormControl = new FormControl(null, [
		Validators.required,
		Validators.min(18),
		Validators.max(120),
	]);
	password: FormControl = new FormControl("", [
		Validators.required,
		Validators.pattern(
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
		),
	]);
	confirmPassword: FormControl = new FormControl("", [Validators.required]);

	phoneNumber: FormControl = new FormControl("", [
		Validators.required,
		Validators.minLength(13),
		Validators.maxLength(13),
	]);

	registerForm = new FormGroup(
		{
			name: this.name,
			email: this.email,
			age: this.age,
			password: this.password,
			confirmPassword: this.confirmPassword,
			phoneNumber: this.phoneNumber,
		},
		RegisterValidators.match("password", "confirmPassword")
	);

	constructor() {}

	async register() {
		this.alertColor = "blue";
		this.alertMsg = "Please wait! Your account is being created";
		this.isAlertVisible = true;
		this.inSubmission = true;
		// UserCredential creation
		const user: IUser = (this.registerForm as FilledForm).value;
		try {
			await this.auth.createUser(user);
		} catch (e) {
			console.error(e);
			this.alertColor = "red";
			this.alertMsg = (e as FirebaseError).message;
			this.inSubmission = false;
			return;
		}
		this.alertColor = "green";
		this.alertMsg = "Success! Your account has been created.";
	}
}
