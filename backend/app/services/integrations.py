from __future__ import annotations

from typing import Dict, List


def get_institutional_integrations() -> List[Dict[str, str]]:
    """Metadata catalog for external research & open-data integrations."""
    return [
        {
            "id": "nasa-api",
            "name": "NASA Open APIs & Exoplanet Archive",
            "endpoint": "https://exoplanetarchive.ipac.caltech.edu/TAP/sync",
            "portal": "https://api.nasa.gov",
            "coverage": "Exoplanet census, Operation IceBridge polar radar, Earth Observatory imagery",
        },
        {
            "id": "usgs-datasets",
            "name": "USGS Geospatial & Earthquake Data",
            "endpoint": "https://earthquake.usgs.gov/fdsnws/event/1/",
            "portal": "https://www.usgs.gov",
            "coverage": "Tectonic subduction profiles, elevation datasets, mineral/geologic surveys",
        },
        {
            "id": "smithsonian-open-access",
            "name": "Smithsonian Open Access API",
            "endpoint": "https://api.si.edu/openaccess/api/v1.0/search",
            "portal": "https://www.si.edu/openaccess",
            "coverage": "CC0 archaeological artifacts, anthropological records, archival photography",
        },
        {
            "id": "noaa-ncei",
            "name": "NOAA Ocean Exploration & NCEI Bathymetry",
            "endpoint": "https://www.ncei.noaa.gov/access/services/data/v1",
            "portal": "https://oceanexplorer.noaa.gov",
            "coverage": "Mariana Trench multibeam bathymetry, Gulf Stream currents, marine climatology",
        },
        {
            "id": "bas-polar",
            "name": "British Antarctic Survey Polar Data Centre",
            "endpoint": "https://data.bas.ac.uk",
            "portal": "https://www.bas.ac.uk",
            "coverage": "Bedmap2 subglacial bedrock grids and Antarctic ice-thickness surveys",
        },
        {
            "id": "national-archives",
            "name": "National Archives & Official Aviation/Naval Inquiries",
            "endpoint": "https://catalog.archives.gov/api/v2/records",
            "portal": "https://www.archives.gov",
            "coverage": "Primary naval/aviation logs (Flight 19, ATSB MH370 dossiers)",
        },
        {
            "id": "google-scholar",
            "name": "Peer-Reviewed Literature & Google Scholar Metadata",
            "endpoint": "https://scholar.google.com",
            "portal": "https://scholar.google.com",
            "coverage": "Nature, Science, PNAS, Cell, Physical Review, and arXiv preprints",
        },
    ]
