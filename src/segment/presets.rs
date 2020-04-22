extern crate serde;
extern crate serde_json;

use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize)]
struct Preset {
  cmd: String,
  name: String,
  extension: String,
}

pub fn presets(width: u16) -> Vec<String> {
  println!("Getting video presets");

  let libx264_480p = Preset {
      extension: "mkv".to_string(),
      name: "libx264_480p".to_string(),
      cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=854-2 -crf 28 -coder 1 -pix_fmt yuv420p -bf2".to_string()
  };

  let libx264_720p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_720p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=1280:-2 -crf 25 -coder 1 -pix_fmt yuv420p -bf2".to_string()
  };

  let libx264_1080p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_1080p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=1920:-2 -crf 24 -coder 1 -pix_fmt yuv420p -bf2".to_string()
  };

  let libx264_1440p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_1440p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=2560:-2 -crf 23 -coder 1 -pix_fmt yuv420p -bf2".to_string()
  };

  let libx264_2160p = Preset {
    extension: "mkv".to_string(),
    name: "libx264_3840p".to_string(),
    cmd: "-c:v libx264 -preset medium -profile:v high -vf scale=3840:-2 -crf 22 -coder 1 -pix_fmt yuv420p -bf2".to_string()
  };

  let mut presets: Vec<String> = vec![];

  if width >= 854 {
    println!("Adding 480p preset");
    presets.push(serde_json::to_string(&libx264_480p).unwrap());
  }

  if width >= 1280 {
    println!("Adding 720p preset");
    presets.push(serde_json::to_string(&libx264_720p).unwrap());
  }

  if width >= 1920 {
    println!("Adding 720p preset");
    presets.push(serde_json::to_string(&libx264_1080p).unwrap());
  }

  if width >= 2560 {
    println!("Adding 720p preset");
    presets.push(serde_json::to_string(&libx264_1440p).unwrap());
  }

  if width >= 3840 {
    println!("Adding 720p preset");
    presets.push(serde_json::to_string(&libx264_2160p).unwrap());
  }

  println!("Video presets: {:?}", presets);
  return presets;
}
