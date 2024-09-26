import { $ } from "bun";

const cultural_50m = [
    'ne_10m_admin_1_sel',
    'ne_50m_admin_0_boundary_lines_disputed_areas',
    'ne_50m_admin_0_boundary_lines_land',
    'ne_50m_admin_0_boundary_lines_maritime_indicator_chn',
    'ne_50m_admin_0_boundary_lines_maritime_indicator',
    'ne_50m_admin_0_boundary_map_units',
    'ne_50m_admin_0_breakaway_disputed_areas_scale_rank',
    'ne_50m_admin_0_breakaway_disputed_areas',
    'ne_50m_admin_0_countries_lakes',
    'ne_50m_admin_0_countries',
    'ne_50m_admin_0_map_subunits',
    'ne_50m_admin_0_map_units',
    'ne_50m_admin_0_pacific_groupings',
    'ne_50m_admin_0_scale_rank',
    'ne_50m_admin_0_sovereignty',
    'ne_50m_admin_0_tiny_countries_scale_rank',
    'ne_50m_admin_0_tiny_countries',
    'ne_50m_admin_1_seams',
    'ne_50m_admin_1_states_provinces_lakes',
    'ne_50m_admin_1_states_provinces_lines',
    'ne_50m_admin_1_states_provinces_scale_rank',
    'ne_50m_admin_1_states_provinces',
    'ne_50m_airports',
    'ne_50m_populated_places_simple',
    'ne_50m_populated_places',
    'ne_50m_ports',
    'ne_50m_urban_areas',
];

const physical_50m = [
    'ne_50m_antarctic_ice_shelves_lines',
    'ne_50m_antarctic_ice_shelves_polys',
    'ne_50m_coastline',
    'ne_50m_geographic_lines',
    'ne_50m_geography_marine_polys',
    'ne_50m_geography_regions_elevation_points',
    'ne_50m_geography_regions_points',
    'ne_50m_geography_regions_polys',
    'ne_50m_glaciated_areas',
    'ne_50m_graticules_1',
    'ne_50m_graticules_10',
    'ne_50m_graticules_15',
    'ne_50m_graticules_20',
    'ne_50m_graticules_30',
    'ne_50m_graticules_5',
    'ne_50m_lakes_historic',
    'ne_50m_lakes',
    'ne_50m_land',
    'ne_50m_ocean',
    'ne_50m_playas',
    'ne_50m_rivers_lake_centerlines_scale_rank',
    'ne_50m_rivers_lake_centerlines',
    'ne_50m_wgs84_bounding_box'
];

const dir = 'data/natural_earth_vector/50m_physical';

// cultural_layers_50m.forEach(async (layer) => {
//     await $`ogr2ogr -f GeoJSON ${dir}/${layer}.geojson ${dir}/shapefiles/${layer}.shp`;
//     await $`tippecanoe -zg -pC --force -o ${dir}/${layer}.mbtiles --drop-densest-as-needed ${dir}/${layer}.geojson`;
// })


for (const layer of physical_50m) {
    await $`ogr2ogr -f GeoJSON ${dir}/geojson/${layer}.geojson ${dir}/shapefiles/${layer}.shp`;
    await $`tippecanoe -zg -pC --force -o ${dir}/mbtiles/${layer}.mbtiles --drop-densest-as-needed ${dir}/geojson/${layer}.geojson`;
}