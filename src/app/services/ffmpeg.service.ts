import { Injectable } from "@angular/core";
import { createFFmpeg, FFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

@Injectable({
	providedIn: "root",
})
export class FfmpegService {
	isReady: boolean = false;
	isRunning: boolean = false;
	private ffmpeg!: FFmpeg;
	private ffprobe!: any;
	constructor() {
		this.ffmpeg = createFFmpeg({ log: true });
	}

	async init() {
		if (this.isReady) return;
		try {
			await this.ffmpeg.load();
			const { FFprobeWorker } = await import("ffprobe-wasm");
			this.ffprobe = new FFprobeWorker();
		} catch (e) {
			throw e;
		}
		this.isReady = true;
	}

	async getScreenshots(file: File): Promise<string[]> {
		this.isRunning = true;
		let screenshots: string[] = [];
		try {
			const data = await fetchFile(file);
			this.ffmpeg.FS("writeFile", file.name, data);

			const info = await this.ffprobe.getFileInfo(file);

			const duration = info.format.duration;

			// Convert the duration to a floating-point number
			const durationInSeconds = parseFloat(duration);
			// Calculate the timestamps for the desired points
			const timestamps: string[] = [];
			const points: number[] = [0.25, 0.5, 0.75]; // Points at 25%, 50%, and 75% of the duration

			for (const point of points) {
				const timestamp = durationInSeconds * point;
				timestamps.push(timestamp.toString());
			}

			// Outputs an array with the three timestamps
			const commands: string[] = [];
			timestamps.forEach((timestamp, index) => {
				commands.push(
					// Input
					"-i",
					file.name,
					// Output Options
					"-ss",
					`${timestamp}`,
					"-frames:v",
					"1",
					"-filter:v",
					"scale=510:-1",
					// Output
					`output_0${index + 1}.png`
				);
			});
			await this.ffmpeg.run(...commands);

			let index = 1;
			while (index < 4) {
				const screenshotFile = this.ffmpeg.FS(
					"readFile",
					`output_0${index}.png`
				);
				const screenshotBlob = new Blob([screenshotFile.buffer], {
					type: "image/png",
				});
				const screenshotURL = URL.createObjectURL(screenshotBlob);
				screenshots.push(screenshotURL);
				index++;
			}
		} catch (e) {
			throw e;
		} finally {
			this.isRunning = false;
		}
		return screenshots;
	}

	async getBlobFromUrl(url: string): Promise<Blob> {
		const response = await fetch(url);
		return await response.blob();
	}
}
