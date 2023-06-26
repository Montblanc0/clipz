import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { Subscription } from "rxjs";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements OnInit, OnDestroy {
	auth: AuthService = inject(AuthService);
	showModal: boolean = true;
	authSubscription$$!: Subscription;
	showModal$ = signal(true);

	constructor() {}

	ngOnInit(): void {
		this.authSubscription$$ = this.auth.isAuthenticated$.subscribe(user => {
			if (user) {
				setTimeout(() => (this.showModal = false), 1000);
			} else this.showModal = true;
		});
	}

	ngOnDestroy(): void {
		if (this.authSubscription$$) this.authSubscription$$.unsubscribe();
	}
}
