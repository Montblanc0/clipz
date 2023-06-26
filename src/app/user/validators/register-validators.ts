import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class RegisterValidators {
	static match(control1: string, control2: string): ValidatorFn {
		return (group: AbstractControl): ValidationErrors | null => {
			const control = group.get(control1);
			const matchingControl = group.get(control2);

			if (!control || !matchingControl) {
				console.error("Form controls cannot be found in the FormGroup");
				return { controlNotFound: false };
			}
			const error =
				control.value === matchingControl.value
					? null
					: { noMatch: true };
			matchingControl.setErrors(error);
			return error;
		};
	}
}
