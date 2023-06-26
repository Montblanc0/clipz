import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { clipResolver } from "./clip.resolver";

describe("clipResolver", () => {
	const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
		TestBed.runInInjectionContext(() =>
			clipResolver(...resolverParameters)
		);

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it("should be created", () => {
		expect(executeResolver).toBeTruthy();
	});
});
