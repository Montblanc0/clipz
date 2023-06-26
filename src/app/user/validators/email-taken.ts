import { Injectable, inject } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import {
	AbstractControl,
	AsyncValidator,
	ValidationErrors,
} from "@angular/forms";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class EmailTaken implements AsyncValidator {
	private auth: AngularFireAuth = inject(AngularFireAuth);

	// `this` will be undefined unless using arrow function
	validate = (
		control: AbstractControl<any, any>
	):
		| Promise<ValidationErrors | null>
		| Observable<ValidationErrors | null> => {
		return this.auth
			.fetchSignInMethodsForEmail(control.value)
			.then(arr => (arr.length ? { emailTaken: true } : null));
	};

	constructor() {}

	registerOnValidatorChange?(fn: () => void): void {
		console.error("Method not implemented.");
	}
}
