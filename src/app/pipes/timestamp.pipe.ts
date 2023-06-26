import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import firebase from "firebase/compat/app";
@Pipe({
	name: "timestamp",
})
export class TimestampPipe implements PipeTransform {
	transform(
		value: firebase.firestore.FieldValue | undefined,
		format: string = "MM-dd-yyyy HH:mm"
	): any {
		// format = "mediumDate";
		if (!value) return "";
		const datePipe = new DatePipe("en-US");
		const formattedDate = datePipe.transform(
			(value as firebase.firestore.Timestamp).toDate(),
			format
		);
		return formattedDate || value;
	}
}
