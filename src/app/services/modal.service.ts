import { Injectable } from "@angular/core";

interface IModal {
	id: string;
	isVisible: boolean;
}

@Injectable({ providedIn: "root" })
export class ModalService {
	private _modals: IModal[] = [];

	constructor() {}

	isModalOpen(id: string): boolean {
		return !!this._modals.find(el => el.id === id)?.isVisible;
	}

	register(id: string) {
		this._modals.push({
			id,
			isVisible: false,
		});
	}
	unregister(id: string) {
		this._modals = this._modals.filter(el => el.id !== id);
	}
	toggleModal(id: string) {
		const modal = this._modals.find(el => el.id === id);
		if (!modal)
			throw new Error(`No modal with id: ${id} has been registered`);
		modal.isVisible = !modal.isVisible;
	}
}
