module "tidal_dev_segmentation_spawner" {
  function_name = "tidal-dev-segmentation-spawner"
  source        = "./modules/tidal_segmentation_spawner"
}

module "tidal_dev_transcode_enqueuer" {
  function_name = "tidal-dev-transcode-enqueuer"
  source        = "./modules/tidal_transcode_enqueuer"
}
