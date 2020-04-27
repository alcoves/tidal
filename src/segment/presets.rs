extern crate serde;
extern crate serde_json;

use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize)]
pub struct Preset {
  pub cmd: String,
  pub name: String,
  pub extension: String,
}

pub fn presets(width: u16) -> Vec<Preset> {
  println!("Getting video presets");

  let libx264_480p = Preset {
      extension: "mkv".to_string(),
      name: "libx264_480p".to_string(),
      cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=854:-2 -crf 28 -coder 1 -pix_fmt yuv420p -bf 2".to_string()
  };

  let libx264_720p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_720p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=1280:-2 -crf 25 -coder 1 -pix_fmt yuv420p -bf 2".to_string()
  };

  let libx264_1080p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_1080p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=1920:-2 -crf 24 -coder 1 -pix_fmt yuv420p -bf 2".to_string()
  };

  let libx264_1440p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_1440p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=2560:-2 -crf 23 -coder 1 -pix_fmt yuv420p -bf 2".to_string()
  };

  let libx264_2160p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_2160p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=3840:-2 -crf 22 -coder 1 -pix_fmt yuv420p -bf 2".to_string()
  };

  let mut presets: Vec<Preset> = vec![];

  if width >= 854 {
    println!("Adding 480p preset");
    presets.push(libx264_480p);
  }

  if width >= 1280 {
    println!("Adding 720p preset");
    presets.push(libx264_720p);
  }

  if width >= 1920 {
    println!("Adding 720p preset");
    presets.push(libx264_1080p);
  }

  if width >= 2560 {
    println!("Adding 720p preset");
    presets.push(libx264_1440p);
  }

  if width >= 3840 {
    println!("Adding 720p preset");
    presets.push(libx264_2160p);
  }

  return presets;
}
