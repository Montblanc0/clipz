import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { ClipComponent } from "./clip/clip.component";
import { NotFoundComponent } from "./notfound/notfound.component";
import { clipResolver } from "./resolvers/clip.resolver";

const routes: Routes = [
	{ path: "", component: HomeComponent },
	{ path: "about", component: AboutComponent },
	{
		path: "clip/:id",
		component: ClipComponent,
		resolve: {
			clip: clipResolver,
		},
	},
	{
		path: "",
		loadChildren: async () =>
			(await import("./video/video.module")).VideoModule,
	},
	{ path: "error", component: NotFoundComponent },
	{ path: "**", component: NotFoundComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
