# Apple Music Downloader

## Usage

0. Install NodeJS LTS
1. Install Dependencies with `npm i`
2. Build the application with `npm run build`
3. Acquire the XML file for your specific playlist from Apple Music or iTunes.
   Place this file in the root level and name it `playlist.xml`.
4. Run the application with `npm start`.
5. The downloaded files should appear inside `music` folder.

## Troubleshooting

- The default configuration uses FFMPEG to write metadata for the files. This
  requires FFMPEG to be installed AND on your system path. If you do not need
  this functionality, then you can disable it in the configuration located in
  `/src/config.ts`

## Notes

This application uses `https://slider.kz/` to download the files. I do not own
this service, nor am I responsible for how this bot is used in any way. The
application concurrently downloads `5` tracks at a time to avoid overloading the
server. This value can be changed at your own discretion.