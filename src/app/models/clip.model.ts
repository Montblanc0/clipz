import firebase from "firebase/compat/app";

export default interface ClipModel {
	uid: string;
	author: string;
	title: string;
	fileName: string;
	url: URL;
	screenshot: URL;
	screenshotFileName: string;
	timestamp: firebase.firestore.FieldValue;
	type: string;
	docID?: string;
}
