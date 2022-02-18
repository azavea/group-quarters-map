# Group Quarters Population Map

This map displays group quarters population in the 2020 US census. It was designed to increase transparency and public understanding of the census data for populations living outside traditional "housing units" and instead residing in university student housing, adult correctional facilities, juvenile facilities, nursing homes, and military quarters.

## Hosting


## Development

This application uses static assets and has no build process.

### Install dependencies

-   Netlify CLI: [installation instructions](https://www.netlify.com/products/cli/)

### Start development server

-   Run `netlify dev`

## Generating tiles

This project contains pregenerated vector tiles that contain all of the map features. If you need to change these geograpic features, you will need to regenerate the tiles.

### Install dependencies

-   Tippecanoe: [installation instructions](https://github.com/mapbox/tippecanoe#installation)
-   MBUtil: [installation instructions](https://github.com/mapbox/mbutil#installation)

### Data processing scripts

-   See `./scripts/data-processing.py` for data collection process
-   See `./scripts/group-quarters-tile-scripts.txt` for commands to generate tiles
