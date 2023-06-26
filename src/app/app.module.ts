import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { UserModule } from "./user/user.module";
import { NavComponent } from "./nav/nav.component";
import { environment } from "src/environments/environment.development";
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { ClipComponent } from "./clip/clip.component";
import { NotFoundComponent } from "./notfound/notfound.component";
import { ClipsListComponent } from "./clips-list/clips-list.component";
import { TimestampPipe } from "./pipes/timestamp.pipe";
@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		HomeComponent,
		AboutComponent,
		ClipComponent,
		NotFoundComponent,
		ClipsListComponent,
		TimestampPipe,
	],
	imports: [
		BrowserModule,
		UserModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule,
		AngularFirestoreModule,
		AngularFireStorageModule,
		AppRoutingModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
