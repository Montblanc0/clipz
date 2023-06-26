import {
	AfterContentInit,
	Component,
	ContentChildren,
	QueryList,
} from "@angular/core";
import { TabComponent } from "../tab/tab.component";

@Component({
	selector: "app-tabs-container",
	templateUrl: "./tabs-container.component.html",
	styleUrls: ["./tabs-container.component.sass"],
})
export class TabsContainerComponent implements AfterContentInit {
	@ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
		new QueryList();

	ngAfterContentInit(): void {
		const activeTabs = this.tabs.filter(tab => tab.isActive);
		if (activeTabs.length === 0) this.selectTab(this.tabs.first);
	}

	selectTab(tab: TabComponent): false {
		this.tabs.forEach(tab => (tab.isActive = false));
		tab.isActive = true;
		// automatically prevents default without using $event
		return false;
	}
}
